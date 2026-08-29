"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  createLiveProgramCheckout,
  createTeacherServiceCheckout,
  openEarnMoreDispute,
  registerTeacherPayoutAccount,
  requestTeacherPayout,
  reserveLiveProgramSeat,
  reserveTeacherServiceBooking,
  submitRecordedProgramForReview
} from "@/services/earn-more-fulfilment-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function date(value: string) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) throw new Error("Choose a valid date and time.");
  return parsed;
}

async function currentWorkspaceUser() {
  const user = await requireCurrentUser();
  if (!user.institutionId) throw new Error("A workspace is required.");
  return { id: user.id, institutionId: user.institutionId };
}

export async function reserveEarnMoreBookingAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  const booking = await reserveTeacherServiceBooking({
    institutionId: user.institutionId,
    learnerId: user.id,
    serviceId: value(formData, "serviceId"),
    planId: value(formData, "planId"),
    startsAt: date(value(formData, "startsAt")),
    endsAt: date(value(formData, "endsAt")),
    timezone: value(formData, "timezone"),
    idempotencyKey: value(formData, "idempotencyKey"),
    bookingRequestId: value(formData, "bookingRequestId") || undefined
  });
  revalidatePath("/student/teachers");
  return booking;
}

export async function createEarnMoreBookingCheckoutAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  return createTeacherServiceCheckout({ institutionId: user.institutionId, learnerId: user.id, bookingId: value(formData, "bookingId") });
}

export async function reserveLiveProgramSeatAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  const registration = await reserveLiveProgramSeat({ institutionId: user.institutionId, learnerId: user.id, programId: value(formData, "programId"), idempotencyKey: value(formData, "idempotencyKey") });
  revalidatePath("/student/marketplace");
  return registration;
}

export async function createLiveProgramCheckoutAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  return createLiveProgramCheckout({ institutionId: user.institutionId, learnerId: user.id, registrationId: value(formData, "registrationId") });
}

export async function submitRecordedProgramAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  const review = await submitRecordedProgramForReview({ institutionId: user.institutionId, teacherId: user.id, contentItemId: value(formData, "contentItemId") });
  revalidatePath("/teacher/business/publishing");
  return review;
}

export async function registerPayoutProviderAccountAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  const account = await registerTeacherPayoutAccount({ institutionId: user.institutionId, teacherId: user.id, provider: value(formData, "provider"), recipientReference: value(formData, "recipientReference") });
  revalidatePath("/teacher/business/payouts");
  return account;
}

export async function requestPayoutAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  const request = await requestTeacherPayout({ institutionId: user.institutionId, teacherId: user.id, accountId: value(formData, "accountId"), amount: Number(value(formData, "amount")), currency: value(formData, "currency") || "INR" });
  revalidatePath("/teacher/business/payouts");
  revalidatePath("/teacher/business/wallet");
  return request;
}

export async function openEarnMoreDisputeAction(formData: FormData) {
  const user = await currentWorkspaceUser();
  const dispute = await openEarnMoreDispute({ institutionId: user.institutionId, actorId: user.id, orderId: value(formData, "orderId"), reason: value(formData, "reason") });
  revalidatePath("/teacher/business/orders");
  revalidatePath("/student/marketplace");
  return dispute;
}
