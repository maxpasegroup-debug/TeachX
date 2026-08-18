"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createCommerceOrder, ensureWallet } from "@/services/commerce-service";
import { getLearningResource, getResourceMetadata } from "@/services/learning-marketplace-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const raw = Number(value(formData, key));
  return Number.isFinite(raw) ? raw : 0;
}

async function createDraftCommerceInvoice(input: {
  orderId: string;
  buyerId: string;
  buyerName?: string | null;
  buyerEmail?: string | null;
  institutionId?: string | null;
  subtotal: number;
  total: number;
  tax?: number;
  metadata?: Record<string, unknown>;
}) {
  const count = await prisma.commerceInvoice.count({ where: { institutionId: input.institutionId ?? undefined } });
  return prisma.commerceInvoice.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      orderId: input.orderId,
      buyerId: input.buyerId,
      invoiceNumber: `TX-COM-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
      billingName: input.buyerName ?? "TeachX customer",
      billingEmail: input.buyerEmail ?? "billing@teachx.guru",
      subtotal: input.subtotal,
      tax: input.tax ?? 0,
      total: input.total,
      status: "DRAFT",
      metadata: { ...input.metadata, launchInvoice: true }
    }
  });
}

export async function createResourcePurchaseOrderAction(formData: FormData) {
  const session = await auth();
  const resourceId = value(formData, "resourceId");
  const resource = resourceId ? await getLearningResource(resourceId) : null;
  if (!session?.user.id || !resource) return;

  const metadata = getResourceMetadata(resource);
  const amount = metadata.priceType === "Premium" ? numberValue(formData, "amount") || 199 : 0;
  await createCommerceOrder({
    buyerId: session.user.id,
    institutionId: session.user.institutionId,
    type: "RESOURCE_PURCHASE",
    title: resource.title,
    itemType: "RESOURCE",
    amount,
    resourceId: resource.id,
    sellerId: resource.createdById,
    metadata: { provider: "future", source: "learning-marketplace", priceType: metadata.priceType ?? "Free" }
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      institutionId: session.user.institutionId,
      title: "Order created",
      body: amount > 0 ? "Payment checkout will be connected in a later phase." : `${resource.title} is now available.`,
      link: "/student/purchases"
    }
  });

  if (resource.createdById && resource.createdById !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: resource.createdById,
        institutionId: resource.institutionId,
        title: "Resource order created",
        body: `${session.user.name ?? "A student"} created an order for ${resource.title}.`,
        link: "/teacher/business/wallet"
      }
    });
  }

  revalidatePath(`/resources/${resource.id}`);
  revalidatePath("/student/purchases");
  revalidatePath("/teacher/business/wallet");
}

export async function changeSubscriptionAction(formData: FormData) {
  const session = await auth();
  const planId = value(formData, "planId");
  if (!session?.user.id || !planId) return;

  const plan = await prisma.subscriptionPlan.findFirst({ where: { id: planId, isActive: true } });
  if (!plan) return;

  const amount = Number(plan.price);
  if (amount > 0) {
    const order = await createCommerceOrder({
      buyerId: session.user.id,
      institutionId: session.user.institutionId,
      type: "SUBSCRIPTION_PURCHASE",
      title: plan.name,
      itemType: "SUBSCRIPTION",
      amount,
      planId: plan.id,
      metadata: {
        interval: plan.interval,
        provider: "checkout-ready",
        gatewayState: "pending-provider-configuration",
        requestedPlanId: plan.id
      }
    });
    await createDraftCommerceInvoice({
      orderId: order.id,
      buyerId: session.user.id,
      buyerName: session.user.name,
      buyerEmail: session.user.email,
      institutionId: session.user.institutionId,
      subtotal: amount,
      total: amount,
      metadata: { planId: plan.id, checkoutRequired: true }
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        institutionId: session.user.institutionId,
        title: "Checkout order created",
        body: `${plan.name} is ready for payment. Live gateway collection will activate after Razorpay or Stripe is configured.`,
        link: `/checkout/${order.id}`
      }
    });

    revalidatePath("/teacher/business/subscription");
    revalidatePath("/student/purchases");
    revalidatePath("/admin/subscriptions");
    redirect(`/checkout/${order.id}`);
  }

  await prisma.userSubscription.updateMany({ where: { userId: session.user.id, status: "ACTIVE", plan: { audience: plan.audience } }, data: { status: "EXPIRED" } });
  await prisma.userSubscription.create({
    data: {
      userId: session.user.id,
      institutionId: session.user.institutionId,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      metadata: { source: "commerce-os", payment: "free-plan" }
    }
  });

  const order = await createCommerceOrder({
    buyerId: session.user.id,
    institutionId: session.user.institutionId,
    type: "SUBSCRIPTION_PURCHASE",
    title: plan.name,
    itemType: "SUBSCRIPTION",
    amount,
    planId: plan.id,
    metadata: { interval: plan.interval, provider: "free-plan", activated: true }
  });
  await createDraftCommerceInvoice({
    orderId: order.id,
    buyerId: session.user.id,
    buyerName: session.user.name,
    buyerEmail: session.user.email,
    institutionId: session.user.institutionId,
    subtotal: amount,
    total: amount,
    metadata: { planId: plan.id, freePlan: true }
  });

  await prisma.notification.create({ data: { userId: session.user.id, institutionId: session.user.institutionId, title: "Subscription updated", body: `Your plan is now ${plan.name}.`, link: "/teacher/business/subscription" } });

  revalidatePath("/teacher/business/subscription");
  revalidatePath("/teacher/business/wallet");
  revalidatePath("/student/purchases");
  revalidatePath("/admin/subscriptions");
}

export async function createAICreditPackOrderAction(formData: FormData) {
  const session = await auth();
  const credits = numberValue(formData, "credits") || 500;
  const amount = numberValue(formData, "amount") || 99;
  if (!session?.user.id) return;

  const wallet = await ensureWallet(session.user.id, session.user.institutionId);
  const order = await createCommerceOrder({
    buyerId: session.user.id,
    institutionId: session.user.institutionId,
    type: "AI_CREDIT_PACK",
    title: `${credits} AI Credits`,
    itemType: "AI_CREDITS",
    amount,
    metadata: { credits, provider: "future" }
  });

  await prisma.walletTransaction.create({
    data: {
      institutionId: session.user.institutionId,
      walletId: wallet.id,
      userId: session.user.id,
      orderId: order.id,
      type: "HOLD",
      amount: credits,
      pending: true,
      description: `${credits} AI credits pending payment`,
      metadata: { creditType: "AI", provider: "future" }
    }
  });

  await prisma.notification.create({ data: { userId: session.user.id, institutionId: session.user.institutionId, title: "AI credit order created", body: "Checkout provider integration is prepared for a later phase.", link: "/student/purchases" } });
  revalidatePath("/teacher/business/wallet");
  revalidatePath("/student/purchases");
}

export async function createBookingReservationOrderAction(formData: FormData) {
  const session = await auth();
  const bookingRequestId = value(formData, "bookingRequestId");
  if (!session?.user.id || !bookingRequestId) return;

  const booking = await prisma.teacherBookingRequest.findFirst({ where: { id: bookingRequestId, OR: [{ studentId: session.user.id }, { teacherId: session.user.id }] } });
  if (!booking) return;

  await createCommerceOrder({
    buyerId: booking.studentId,
    institutionId: session.user.institutionId,
    type: "BOOKING_RESERVATION",
    title: `Booking reservation: ${booking.subject}`,
    itemType: "BOOKING",
    amount: 0,
    bookingRequestId: booking.id,
    sellerId: booking.teacherId,
    metadata: { preferredDate: booking.preferredDate?.toISOString(), preferredTime: booking.preferredTime }
  });

  revalidatePath("/student/purchases");
  revalidatePath("/teacher/business/wallet");
}

export async function createCouponAction(formData: FormData) {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN") || !session.user.institutionId) return;
  const code = value(formData, "code").toUpperCase();
  if (!code) return;

  await prisma.coupon.upsert({
    where: { institutionId_code: { institutionId: session.user.institutionId, code } },
    update: {
      description: value(formData, "description") || undefined,
      campaign: value(formData, "campaign") || undefined,
      discountType: value(formData, "discountType") === "FIXED" ? "FIXED" : "PERCENTAGE",
      discountValue: numberValue(formData, "discountValue"),
      isActive: formData.get("isActive") !== "off",
      metadata: { voucher: true, architectureOnly: true }
    },
    create: {
      institutionId: session.user.institutionId,
      code,
      description: value(formData, "description") || undefined,
      campaign: value(formData, "campaign") || undefined,
      discountType: value(formData, "discountType") === "FIXED" ? "FIXED" : "PERCENTAGE",
      discountValue: numberValue(formData, "discountValue"),
      metadata: { voucher: true, architectureOnly: true }
    }
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/admin/subscriptions");
}

export async function createCommerceInvoicePlaceholderAction(formData: FormData) {
  const session = await auth();
  const orderId = value(formData, "orderId");
  if (!session?.user.id || !orderId) return;

  const order = await prisma.commerceOrder.findFirst({ where: { id: orderId, OR: [{ buyerId: session.user.id }, { institutionId: session.user.institutionId, buyer: { roles: { some: { role: { key: "STUDENT" } } } } }] }, include: { buyer: true } });
  if (!order) return;

  const count = await prisma.commerceInvoice.count({ where: { institutionId: order.institutionId ?? undefined } });
  await prisma.commerceInvoice.create({
    data: {
      institutionId: order.institutionId ?? undefined,
      orderId: order.id,
      buyerId: order.buyerId,
      invoiceNumber: `TX-COM-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
      billingName: order.buyer.name,
      billingEmail: order.buyer.email,
      gstNumber: value(formData, "gstNumber") || undefined,
      billingAddress: value(formData, "billingAddress") || undefined,
      businessDetails: { architectureOnly: true },
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: "DRAFT",
      metadata: { gstReady: true }
    }
  });

  revalidatePath("/student/purchases");
  revalidatePath("/admin/orders");
}
