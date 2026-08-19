"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/security";

const launchFeedbackSchema = z.object({
  mode: z.enum(["feedback", "bug", "support"]),
  rating: z.coerce.number().int().min(0).max(5).optional(),
  confusion: z.string().max(2000).optional(),
  suggestion: z.string().max(2000).optional(),
  title: z.string().max(160).optional(),
  description: z.string().max(3000).optional(),
  severity: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  route: z.string().max(240).optional(),
  browser: z.string().max(800).optional()
});

function priorityFromSeverity(severity?: string) {
  if (severity === "Critical") return "URGENT";
  if (severity === "High") return "HIGH";
  if (severity === "Low") return "LOW";
  return "NORMAL";
}

function subjectFor(input: z.infer<typeof launchFeedbackSchema>) {
  if (input.title?.trim()) return input.title.trim();
  if (input.mode === "bug") return "Launch bug report";
  if (input.mode === "support") return "Teacher support request";
  return input.rating ? `Launch feedback: ${input.rating}/5` : "Launch feedback";
}

function bodyFor(input: z.infer<typeof launchFeedbackSchema>) {
  const lines = [
    input.description?.trim(),
    input.confusion ? `Confusion: ${input.confusion.trim()}` : "",
    input.suggestion ? `Suggestion: ${input.suggestion.trim()}` : "",
    input.rating ? `Rating: ${input.rating}/5` : ""
  ].filter(Boolean);

  return lines.join("\n\n") || "No additional message provided.";
}

export async function submitLaunchFeedbackAction(formData: FormData) {
  const session = await auth();
  if (!session?.user.id) return { ok: false, message: "Please sign in before sending feedback." };

  const h = await headers();
  const key = h.get("x-forwarded-for")?.split(",")[0]?.trim() || session.user.id;
  const limited = await rateLimit(`launch-feedback:${key}:${session.user.id}`, 8, 60_000);
  if (limited) return { ok: false, message: "Too many feedback submissions. Please try again shortly." };

  const parsed = launchFeedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your feedback." };

  const input = parsed.data;
  const ticket = await prisma.supportTicket.create({
    data: {
      institutionId: session.user.institutionId,
      requesterId: session.user.id,
      type: input.mode === "bug" ? "BUG" : input.mode === "support" ? "SUPPORT" : "FEEDBACK",
      priority: priorityFromSeverity(input.severity),
      subject: subjectFor(input),
      body: bodyFor(input),
      source: "launch-feedback-widget",
      metadata: {
        launchPhase: 5,
        route: input.route,
        browser: input.browser,
        rating: input.rating,
        severity: input.severity
      }
    }
  });

  await writeAuditLog({
    institutionId: session.user.institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "SupportTicket",
    entityId: ticket.id,
    message: `Launch feedback submitted: ${ticket.subject}`
  });

  revalidatePath("/admin/support");
  revalidatePath("/admin/launch");
  return { ok: true, message: "Thanks. Your feedback was sent to the TeachX launch team.", ticketId: ticket.id };
}

export async function submitTeacherSupportAction(formData: FormData) {
  await submitLaunchFeedbackAction(formData);
}
