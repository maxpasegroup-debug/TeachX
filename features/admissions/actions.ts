"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getAdmissionSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "admissions.manage")) throw new Error("You do not have admission access.");
  return { session, institutionId };
}

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  education: z.string().optional(),
  interestedCourseId: z.string().optional(),
  preferredBatchId: z.string().optional(),
  sourceId: z.string().optional(),
  campaignId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  remarks: z.string().optional()
});

export async function createLeadAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAdmissionSession();
  const parsed = leadSchema.safeParse({
    name: optionalText(formData.get("name")),
    email: optionalText(formData.get("email")),
    phone: optionalText(formData.get("phone")),
    guardianName: optionalText(formData.get("guardianName")),
    guardianPhone: optionalText(formData.get("guardianPhone")),
    address: optionalText(formData.get("address")),
    education: optionalText(formData.get("education")),
    interestedCourseId: optionalText(formData.get("interestedCourseId")),
    preferredBatchId: optionalText(formData.get("preferredBatchId")),
    sourceId: optionalText(formData.get("sourceId")),
    campaignId: optionalText(formData.get("campaignId")),
    priority: optionalText(formData.get("priority")) ?? "MEDIUM",
    remarks: optionalText(formData.get("remarks"))
  });
  if (!parsed.success) return "Please enter lead details.";

  const lead = await prisma.lead.create({
    data: {
      institutionId,
      assignedExecutiveId: session.user.id,
      ...parsed.data,
      aiSummary: "AI lead summary can be generated here later.",
      aiSuggestedFollowUp: "Suggested follow-up can be generated here later."
    }
  });
  await prisma.leadActivity.create({ data: { leadId: lead.id, actorId: session.user.id, title: "Lead Created", body: lead.remarks } });
  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "Lead", entityId: lead.id, message: `Created lead ${lead.name}` });
  revalidatePath("/admissions");
  return "Lead created.";
}

export async function updateLeadStageAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAdmissionSession();
  const leadId = optionalText(formData.get("leadId"));
  const stage = optionalText(formData.get("stage"));
  if (!leadId || !stage) return "Lead and stage are required.";

  const lead = await prisma.lead.update({ where: { id: leadId, institutionId }, data: { stage: stage as never } });
  await prisma.leadActivity.create({ data: { leadId, actorId: session.user.id, title: "Stage Updated", body: stage } });
  revalidatePath("/admissions");
  return `${lead.name} moved to ${stage}.`;
}

export async function createFollowUpAction(_: string | undefined, formData: FormData) {
  const { session } = await getAdmissionSession();
  const leadId = optionalText(formData.get("leadId"));
  const type = optionalText(formData.get("type")) ?? "CALL";
  const scheduledAt = optionalText(formData.get("scheduledAt"));
  if (!leadId || !scheduledAt) return "Please schedule a follow-up.";

  await prisma.leadFollowUp.create({ data: { leadId, type: type as never, scheduledAt: new Date(scheduledAt), notes: optionalText(formData.get("notes")) } });
  await prisma.leadActivity.create({ data: { leadId, actorId: session.user.id, title: "Follow-up Scheduled", body: type } });
  revalidatePath("/admissions");
  return "Follow-up scheduled.";
}

export async function createLeadTaskAction(_: string | undefined, formData: FormData) {
  const { session } = await getAdmissionSession();
  const leadId = optionalText(formData.get("leadId"));
  const title = optionalText(formData.get("title"));
  if (!leadId || !title) return "Task title is required.";

  await prisma.leadTask.create({ data: { leadId, ownerId: session.user.id, title, deadline: optionalText(formData.get("deadline")) ? new Date(optionalText(formData.get("deadline")) as string) : undefined } });
  await prisma.leadActivity.create({ data: { leadId, actorId: session.user.id, title: "Task Assigned", body: title } });
  revalidatePath("/admissions");
  return "Task created.";
}

export async function createApplicationAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAdmissionSession();
  const leadId = optionalText(formData.get("leadId"));
  if (!leadId) return "Lead is required.";

  const application = await prisma.application.create({
    data: {
      institutionId,
      leadId,
      courseId: optionalText(formData.get("courseId")),
      batchId: optionalText(formData.get("batchId")),
      status: "SUBMITTED",
      formData: { note: optionalText(formData.get("note")) }
    }
  });
  await prisma.lead.update({ where: { id: leadId }, data: { stage: "APPLICATION_SUBMITTED" } });
  await prisma.leadActivity.create({ data: { leadId, actorId: session.user.id, title: "Application Submitted", body: application.id } });
  revalidatePath("/admissions");
  return "Application submitted.";
}

export async function createAdmissionAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAdmissionSession();
  const leadId = optionalText(formData.get("leadId"));
  if (!leadId) return "Lead is required.";

  const admission = await prisma.admission.create({
    data: {
      institutionId,
      leadId,
      applicationId: optionalText(formData.get("applicationId")),
      courseId: optionalText(formData.get("courseId")),
      batchId: optionalText(formData.get("batchId")),
      status: "APPROVED",
      approvedAt: new Date()
    }
  });
  await prisma.lead.update({ where: { id: leadId }, data: { stage: "ADMISSION_APPROVED" } });
  await prisma.leadActivity.create({ data: { leadId, actorId: session.user.id, title: "Admission Approved", body: admission.id } });
  revalidatePath("/admissions");
  return "Admission approved.";
}

export async function createCampaignSourceAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getAdmissionSession();
  const name = optionalText(formData.get("name"));
  const code = optionalText(formData.get("code"));
  if (!name || !code) return "Source name and code are required.";

  await prisma.campaignSource.create({ data: { institutionId, name, code: code.toUpperCase() } });
  revalidatePath("/admissions");
  return "Source created.";
}
