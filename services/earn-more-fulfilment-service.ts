import { Prisma, type TeacherServiceBookingStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

const activeBookingStatuses: TeacherServiceBookingStatus[] = ["RESERVED", "PENDING_PAYMENT", "CONFIRMED"];
const reservationMinutes = 15;

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function ensureFutureRange(startsAt: Date, endsAt: Date) {
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || startsAt <= new Date() || endsAt <= startsAt) {
    throw new Error("Choose a future booking time with a valid end time.");
  }
}

function isConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2010", "P2034"].includes(error.code);
}

async function requireActiveUser(tx: Prisma.TransactionClient, userId: string, institutionId: string) {
  const user = await tx.user.findFirst({ where: { id: userId, institutionId, status: "ACTIVE" }, select: { id: true } });
  if (!user) throw new Error("An active user in this workspace is required.");
  return user;
}

async function requireCommissionPolicy(tx: Prisma.TransactionClient, institutionId: string, source: string) {
  const policy = await tx.earnMoreCommissionPolicy.findFirst({ where: { institutionId, source, isActive: true } });
  if (!policy || policy.commissionBps < 0 || policy.commissionBps > 10_000 || policy.settlementDays < 0 || policy.settlementDays > 365) {
    throw new Error("This earning service is not ready for checkout. A finance administrator must configure its commission policy.");
  }
  return policy;
}

export async function hasPremiumMentorSubscription(input: { userId: string; institutionId: string }) {
  const now = new Date();
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: input.userId,
      institutionId: input.institutionId,
      status: { in: ["ACTIVE", "TRIALING"] },
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }]
    },
    include: { plan: { select: { audience: true, featureFlags: true } } },
    take: 20
  });
  return subscriptions.some((subscription) => {
    const flags = subscription.plan.featureFlags;
    return subscription.plan.audience === "TEACHER" && Boolean(flags && typeof flags === "object" && !Array.isArray(flags) && (flags as Record<string, unknown>).mentorPremium === true);
  });
}

export async function reserveTeacherServiceBooking(input: {
  institutionId: string;
  learnerId: string;
  serviceId: string;
  planId: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  idempotencyKey: string;
  bookingRequestId?: string;
}) {
  if (!input.idempotencyKey || input.idempotencyKey.length > 128) throw new Error("A valid booking request key is required.");
  ensureFutureRange(input.startsAt, input.endsAt);

  try {
    return await prisma.$transaction(async (tx) => {
      await requireActiveUser(tx, input.learnerId, input.institutionId);
      const existing = await tx.teacherServiceBooking.findFirst({
        where: { institutionId: input.institutionId, learnerId: input.learnerId, idempotencyKey: input.idempotencyKey }
      });
      if (existing) return existing;

      const service = await tx.teacherEarningService.findFirst({
        where: { id: input.serviceId, institutionId: input.institutionId, status: "ACTIVE", type: { in: ["MENTOR", "TRAIN"] } },
        include: { plans: { where: { id: input.planId, status: "ACTIVE" }, take: 1 } }
      });
      if (!service || !service.plans[0]) throw new Error("This service or plan is not available.");
      await requireActiveUser(tx, service.teacherId, input.institutionId);
      if (service.type === "MENTOR" && !await hasPremiumMentorSubscription({ userId: service.teacherId, institutionId: input.institutionId })) {
        throw new Error("This mentor cannot accept paid bookings until Premium Mentor is active.");
      }

      const availability = await tx.teacherAvailability.findFirst({ where: { institutionId: input.institutionId, teacherId: service.teacherId } });
      if (!availability) throw new Error("This teacher has not configured availability.");
      const durationMinutes = Math.round((input.endsAt.getTime() - input.startsAt.getTime()) / 60_000);
      if (!availability.sessionDurations.includes(durationMinutes)) throw new Error("This booking duration is not offered by the teacher.");
      const dayBookings = await tx.teacherServiceBooking.count({
        where: { institutionId: input.institutionId, teacherId: service.teacherId, startsAt: { gte: new Date(input.startsAt.getUTCFullYear(), input.startsAt.getUTCMonth(), input.startsAt.getUTCDate()), lt: new Date(input.startsAt.getUTCFullYear(), input.startsAt.getUTCMonth(), input.startsAt.getUTCDate() + 1) }, status: { in: activeBookingStatuses } }
      });
      if (dayBookings >= availability.maxSessionsPerDay) throw new Error("This teacher has reached the daily booking limit.");

      if (input.bookingRequestId) {
        const request = await tx.teacherBookingRequest.findFirst({ where: { id: input.bookingRequestId, teacherId: service.teacherId, studentId: input.learnerId, teacherProfile: { user: { institutionId: input.institutionId } } }, select: { id: true } });
        if (!request) throw new Error("The booking request is not authorized for this service.");
      }

      return tx.teacherServiceBooking.create({
        data: {
          institutionId: input.institutionId,
          teacherId: service.teacherId,
          learnerId: input.learnerId,
          serviceId: service.id,
          servicePlanId: service.plans[0].id,
          bookingRequestId: input.bookingRequestId,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          timezone: input.timezone,
          status: "RESERVED",
          reservationExpiresAt: new Date(Date.now() + reservationMinutes * 60_000),
          idempotencyKey: input.idempotencyKey
        }
      });
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (isConstraintError(error)) throw new Error("That time is no longer available. Please choose another slot.");
    throw error;
  }
}

export async function createTeacherServiceCheckout(input: { institutionId: string; learnerId: string; bookingId: string }) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.teacherServiceBooking.findFirst({
      where: { id: input.bookingId, institutionId: input.institutionId, learnerId: input.learnerId, status: { in: ["RESERVED", "PENDING_PAYMENT"] } },
      include: { service: true, servicePlan: true, order: { include: { items: true } } }
    });
    if (!booking || !booking.service || !booking.servicePlan) throw new Error("A payable booking reservation was not found.");
    if (booking.reservationExpiresAt && booking.reservationExpiresAt <= new Date()) {
      await tx.teacherServiceBooking.update({ where: { id: booking.id }, data: { status: "EXPIRED" } });
      throw new Error("This reservation expired. Please choose a time again.");
    }
    if (booking.order) return booking.order;
    const policy = await requireCommissionPolicy(tx, input.institutionId, booking.service.type);
    const amount = Number(booking.servicePlan.price);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("A positive, teacher-set plan price is required.");
    const order = await tx.commerceOrder.create({
      data: {
        institutionId: input.institutionId,
        buyerId: input.learnerId,
        type: "BOOKING_RESERVATION",
        status: "PENDING_PAYMENT",
        subtotal: amount,
        total: amount,
        currency: booking.servicePlan.currency,
        metadata: { earnMoreSource: booking.service.type, commissionPolicyId: policy.id, bookingId: booking.id },
        items: { create: { itemType: "BOOKING", title: booking.servicePlan.name, quantity: 1, unitPrice: amount, total: amount, sellerId: booking.teacherId, teacherServiceBookingId: booking.id, metadata: { earnMoreSource: booking.service.type, commissionPolicyId: policy.id } } }
      },
      include: { items: true }
    });
    await tx.teacherServiceBooking.update({ where: { id: booking.id }, data: { status: "PENDING_PAYMENT", orderId: order.id } });
    return order;
  }, { isolationLevel: "Serializable" });
}

export async function fulfilTeacherServiceBookingItem(tx: Prisma.TransactionClient, input: { orderId: string; itemId: string; provider: string; providerPaymentId?: string }) {
  const item = await tx.commerceOrderItem.findFirst({ where: { id: input.itemId, orderId: input.orderId }, include: { order: { select: { currency: true } }, teacherServiceBooking: { include: { service: true } } } });
  const booking = item?.teacherServiceBooking;
  if (!item || !booking || !booking.service) throw new Error("Paid booking fulfilment record is invalid.");
  const policy = await requireCommissionPolicy(tx, booking.institutionId, booking.service.type);
  const grossAmount = money(Number(item.total));
  const commissionAmount = money(grossAmount * policy.commissionBps / 10_000);
  const netAmount = money(grossAmount - commissionAmount);
  const availableAt = new Date(Date.now() + policy.settlementDays * 86_400_000);
  const settlement = await tx.earnMoreSettlement.upsert({
    where: { orderId: input.orderId },
    update: {},
    create: {
      institutionId: booking.institutionId,
      orderId: input.orderId,
      bookingId: booking.id,
      teacherId: booking.teacherId,
      source: booking.service.type,
      currency: item.order.currency,
      grossAmount,
      commissionBps: policy.commissionBps,
      commissionAmount,
      netAmount,
      availableAt,
      metadata: { provider: input.provider, providerPaymentId: input.providerPaymentId, itemId: item.id }
    }
  });
  const changed = await tx.teacherServiceBooking.updateMany({ where: { id: booking.id, status: "PENDING_PAYMENT" }, data: { status: "CONFIRMED", reservationExpiresAt: null } });
  if (!changed.count) throw new Error("Booking cannot be confirmed after payment.");
  const wallet = await tx.wallet.upsert({ where: { userId_currency: { userId: booking.teacherId, currency: item.order.currency } }, update: {}, create: { userId: booking.teacherId, institutionId: booking.institutionId, currency: item.order.currency } });
  await tx.walletTransaction.upsert({
    where: { id: `earn-more-pending-${settlement.id}` },
    update: {},
    create: { id: `earn-more-pending-${settlement.id}`, institutionId: booking.institutionId, walletId: wallet.id, userId: booking.teacherId, orderId: input.orderId, type: "EARNING", amount: netAmount, pending: true, description: `Pending ${booking.service.type.toLowerCase()} earnings`, metadata: { settlementId: settlement.id, grossAmount, commissionAmount, commissionBps: policy.commissionBps } }
  });
  await tx.wallet.update({ where: { id: wallet.id }, data: { pendingBalance: { increment: netAmount } } });
  return settlement;
}

export async function makeDueEarnMoreSettlementsAvailable(input: { institutionId: string; now?: Date }) {
  const now = input.now ?? new Date();
  return prisma.$transaction(async (tx) => {
    const settlements = await tx.earnMoreSettlement.findMany({ where: { institutionId: input.institutionId, status: "PENDING", availableAt: { lte: now } }, take: 500 });
    for (const settlement of settlements) {
      const claimed = await tx.earnMoreSettlement.updateMany({ where: { id: settlement.id, status: "PENDING" }, data: { status: "AVAILABLE" } });
      if (!claimed.count) continue;
      const wallet = await tx.wallet.findFirst({ where: { userId: settlement.teacherId, currency: settlement.currency } });
      if (!wallet) throw new Error("Settlement wallet is missing.");
      await tx.walletTransaction.updateMany({ where: { id: `earn-more-pending-${settlement.id}`, pending: true }, data: { pending: false, description: "Earn More settlement available" } });
      await tx.wallet.update({ where: { id: wallet.id }, data: { pendingBalance: { decrement: settlement.netAmount }, balance: { increment: settlement.netAmount }, lifetimeEarnings: { increment: settlement.netAmount } } });
    }
    return settlements.length;
  }, { isolationLevel: "Serializable" });
}

export async function reverseEarnMoreFulfilment(tx: Prisma.TransactionClient, input: { orderId: string; providerRefundId?: string }) {
  const settlement = await tx.earnMoreSettlement.findFirst({ where: { orderId: input.orderId } });
  if (!settlement) return false;
  const changed = await tx.earnMoreSettlement.updateMany({ where: { id: settlement.id, status: { in: ["PENDING", "AVAILABLE", "DISPUTED"] } }, data: { status: "REFUNDED", metadata: { ...(settlement.metadata && typeof settlement.metadata === "object" && !Array.isArray(settlement.metadata) ? settlement.metadata as Prisma.InputJsonObject : {}), providerRefundId: input.providerRefundId } } });
  if (!changed.count) return false;
  if (settlement.bookingId) {
    await tx.teacherServiceBooking.updateMany({ where: { id: settlement.bookingId, institutionId: settlement.institutionId, status: { in: ["CONFIRMED", "COMPLETED", "DISPUTED"] } }, data: { status: "REFUNDED" } });
  }
  const registrationId = settlement.metadata && typeof settlement.metadata === "object" && !Array.isArray(settlement.metadata)
    ? (settlement.metadata as Record<string, unknown>).registrationId
    : undefined;
  if (typeof registrationId === "string") {
    await tx.teacherLiveProgramRegistration.updateMany({ where: { id: registrationId, institutionId: settlement.institutionId, status: "CONFIRMED" }, data: { status: "REFUNDED" } });
  }
  const wallet = await tx.wallet.findFirst({ where: { userId: settlement.teacherId, currency: settlement.currency } });
  if (!wallet) throw new Error("Settlement wallet is missing.");
  const pending = settlement.status === "PENDING";
  await tx.walletTransaction.create({ data: { id: `earn-more-refund-${settlement.id}`, institutionId: settlement.institutionId, walletId: wallet.id, userId: settlement.teacherId, orderId: input.orderId, type: "REFUND", amount: settlement.netAmount, pending, description: "Earn More payment refunded", metadata: { settlementId: settlement.id, providerRefundId: input.providerRefundId } } });
  await tx.wallet.update({ where: { id: wallet.id }, data: pending ? { pendingBalance: { decrement: settlement.netAmount } } : { balance: { decrement: settlement.netAmount }, lifetimeEarnings: { decrement: settlement.netAmount } } });
  return true;
}

export async function reserveLiveProgramSeat(input: { institutionId: string; learnerId: string; programId: string; idempotencyKey: string }) {
  if (!input.idempotencyKey || input.idempotencyKey.length > 128) throw new Error("A valid registration request key is required.");
  return prisma.$transaction(async (tx) => {
    await requireActiveUser(tx, input.learnerId, input.institutionId);
    const existing = await tx.teacherLiveProgramRegistration.findFirst({ where: { institutionId: input.institutionId, learnerId: input.learnerId, idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;
    const program = await tx.teacherLiveProgram.findFirst({ where: { id: input.programId, institutionId: input.institutionId, status: "PUBLISHED", startsAt: { gt: new Date() } } });
    if (!program) throw new Error("This live program is not available.");
    await requireCommissionPolicy(tx, input.institutionId, "PUBLISH");
    const reserved = await tx.teacherLiveProgramRegistration.count({ where: { institutionId: input.institutionId, programId: program.id, status: { in: ["RESERVED", "PENDING_PAYMENT", "CONFIRMED"] } } });
    if (reserved >= program.capacity) throw new Error("This live program is sold out.");
    return tx.teacherLiveProgramRegistration.create({ data: { institutionId: input.institutionId, programId: program.id, learnerId: input.learnerId, status: "RESERVED", reservationExpiresAt: new Date(Date.now() + reservationMinutes * 60_000), idempotencyKey: input.idempotencyKey } });
  }, { isolationLevel: "Serializable" });
}

export async function createLiveProgramCheckout(input: { institutionId: string; learnerId: string; registrationId: string }) {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.teacherLiveProgramRegistration.findFirst({ where: { id: input.registrationId, institutionId: input.institutionId, learnerId: input.learnerId, status: { in: ["RESERVED", "PENDING_PAYMENT"] } }, include: { program: true, order: { include: { items: true } } } });
    if (!registration || !registration.program) throw new Error("A payable live-program reservation was not found.");
    if (registration.reservationExpiresAt && registration.reservationExpiresAt <= new Date()) {
      await tx.teacherLiveProgramRegistration.update({ where: { id: registration.id }, data: { status: "CANCELLED" } });
      throw new Error("This seat reservation expired. Please register again.");
    }
    if (registration.order) return registration.order;
    const policy = await requireCommissionPolicy(tx, input.institutionId, "PUBLISH");
    const amount = Number(registration.program.price);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("A positive program price is required.");
    const order = await tx.commerceOrder.create({
      data: {
        institutionId: input.institutionId,
        buyerId: input.learnerId,
        type: "BOOKING_RESERVATION",
        status: "PENDING_PAYMENT",
        subtotal: amount,
        total: amount,
        currency: registration.program.currency,
        metadata: { earnMoreSource: "PUBLISH", registrationId: registration.id, commissionPolicyId: policy.id },
        items: { create: { itemType: "BOOKING", title: registration.program.title, unitPrice: amount, total: amount, sellerId: registration.program.teacherId, metadata: { earnMoreSource: "PUBLISH", liveProgramRegistrationId: registration.id, commissionPolicyId: policy.id } } }
      },
      include: { items: true }
    });
    await tx.teacherLiveProgramRegistration.update({ where: { id: registration.id }, data: { status: "PENDING_PAYMENT", orderId: order.id } });
    return order;
  }, { isolationLevel: "Serializable" });
}

export async function fulfilLiveProgramRegistrationItem(tx: Prisma.TransactionClient, input: { orderId: string; registrationId: string; provider: string; providerPaymentId?: string }) {
  const registration = await tx.teacherLiveProgramRegistration.findFirst({ where: { id: input.registrationId, orderId: input.orderId }, include: { program: true, order: { select: { currency: true } } } });
  if (!registration || !registration.program || !registration.order) throw new Error("Paid live-program fulfilment record is invalid.");
  const policy = await requireCommissionPolicy(tx, registration.institutionId, "PUBLISH");
  const grossAmount = money(Number(registration.program.price));
  const commissionAmount = money(grossAmount * policy.commissionBps / 10_000);
  const netAmount = money(grossAmount - commissionAmount);
  const settlement = await tx.earnMoreSettlement.upsert({
    where: { orderId: input.orderId },
    update: {},
    create: { institutionId: registration.institutionId, orderId: input.orderId, teacherId: registration.program.teacherId, source: "PUBLISH", currency: registration.order.currency, grossAmount, commissionBps: policy.commissionBps, commissionAmount, netAmount, availableAt: new Date(Date.now() + policy.settlementDays * 86_400_000), metadata: { provider: input.provider, providerPaymentId: input.providerPaymentId, registrationId: registration.id, programId: registration.program.id } }
  });
  const changed = await tx.teacherLiveProgramRegistration.updateMany({ where: { id: registration.id, status: "PENDING_PAYMENT" }, data: { status: "CONFIRMED", reservationExpiresAt: null } });
  if (!changed.count) throw new Error("Live program registration cannot be confirmed after payment.");
  const wallet = await tx.wallet.upsert({ where: { userId_currency: { userId: registration.program.teacherId, currency: registration.order.currency } }, update: {}, create: { userId: registration.program.teacherId, institutionId: registration.institutionId, currency: registration.order.currency } });
  await tx.walletTransaction.upsert({ where: { id: `earn-more-pending-${settlement.id}` }, update: {}, create: { id: `earn-more-pending-${settlement.id}`, institutionId: registration.institutionId, walletId: wallet.id, userId: registration.program.teacherId, orderId: input.orderId, type: "EARNING", amount: netAmount, pending: true, description: "Pending live program earnings", metadata: { settlementId: settlement.id, grossAmount, commissionAmount, commissionBps: policy.commissionBps } } });
  await tx.wallet.update({ where: { id: wallet.id }, data: { pendingBalance: { increment: netAmount } } });
  return settlement;
}

export async function registerTeacherPayoutAccount(input: { institutionId: string; teacherId: string; provider: string; recipientReference: string }) {
  if (!input.provider || !input.recipientReference) throw new Error("A verified payout-provider recipient reference is required.");
  return prisma.teacherPayoutAccount.upsert({
    where: { institutionId_teacherId_provider: { institutionId: input.institutionId, teacherId: input.teacherId, provider: input.provider } },
    update: { recipientReference: input.recipientReference, status: "PENDING_REVIEW", kycStatus: "PENDING", verifiedAt: null },
    create: { institutionId: input.institutionId, teacherId: input.teacherId, provider: input.provider, recipientReference: input.recipientReference, status: "PENDING_REVIEW", kycStatus: "PENDING" }
  });
}

export async function requestTeacherPayout(input: { institutionId: string; teacherId: string; accountId: string; amount: number; currency: string }) {
  const amount = money(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a positive payout amount.");
  return prisma.$transaction(async (tx) => {
    const account = await tx.teacherPayoutAccount.findFirst({ where: { id: input.accountId, institutionId: input.institutionId, teacherId: input.teacherId, status: "VERIFIED", kycStatus: "VERIFIED" } });
    if (!account) throw new Error("A verified payout account is required before requesting a withdrawal.");
    const wallet = await tx.wallet.findFirst({ where: { userId: input.teacherId, institutionId: input.institutionId, currency: input.currency } });
    if (!wallet || Number(wallet.balance) < amount) throw new Error("Your available earnings do not cover this withdrawal.");
    const request = await tx.teacherPayoutRequest.create({ data: { institutionId: input.institutionId, teacherId: input.teacherId, accountId: account.id, amount, currency: input.currency, status: "REQUESTED" } });
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount } } });
    await tx.walletTransaction.create({ data: { institutionId: input.institutionId, walletId: wallet.id, userId: input.teacherId, type: "HOLD", amount, pending: true, description: "Payout requested", metadata: { payoutRequestId: request.id } } });
    return request;
  }, { isolationLevel: "Serializable" });
}

export async function openEarnMoreDispute(input: { institutionId: string; actorId: string; orderId: string; reason: string }) {
  if (!input.reason.trim()) throw new Error("Tell us why this transaction is disputed.");
  return prisma.$transaction(async (tx) => {
    const order = await tx.commerceOrder.findFirst({ where: { id: input.orderId, institutionId: input.institutionId, OR: [{ buyerId: input.actorId }, { earnMoreSettlements: { some: { teacherId: input.actorId } } }] }, include: { teacherServiceBooking: true } });
    if (!order) throw new Error("This order is not available to dispute.");
    const existing = await tx.earnMoreDispute.findFirst({ where: { orderId: order.id, status: { in: ["OPEN", "UNDER_REVIEW"] } } });
    if (existing) return existing;
    await tx.earnMoreSettlement.updateMany({ where: { orderId: order.id, status: { in: ["PENDING", "AVAILABLE"] } }, data: { status: "DISPUTED" } });
    if (order.teacherServiceBooking) await tx.teacherServiceBooking.updateMany({ where: { id: order.teacherServiceBooking.id, institutionId: input.institutionId, status: { in: ["CONFIRMED", "COMPLETED"] } }, data: { status: "DISPUTED" } });
    return tx.earnMoreDispute.create({ data: { institutionId: input.institutionId, orderId: order.id, bookingId: order.teacherServiceBooking?.id, raisedById: input.actorId, reason: input.reason.trim() } });
  }, { isolationLevel: "Serializable" });
}

export async function submitRecordedProgramForReview(input: { institutionId: string; teacherId: string; contentItemId: string }) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.contentItem.findFirst({ where: { id: input.contentItemId, institutionId: input.institutionId, createdById: input.teacherId, status: "DRAFT" } });
    if (!item) throw new Error("Only the owner can submit a draft program for review.");
    await tx.contentItem.update({ where: { id: item.id }, data: { status: "SUBMITTED" } });
    return tx.contentReview.create({ data: { itemId: item.id, stage: "EARN_MORE_RECORDED_PROGRAM", decision: "PENDING" } });
  }, { isolationLevel: "Serializable" });
}
