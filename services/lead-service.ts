import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type LeadWithDetails = Prisma.LeadGetPayload<{
  include: {
    interestedCourse: true;
    preferredBatch: true;
    source: true;
    campaign: true;
    assignedExecutive: true;
    activities: true;
    followUps: true;
    tasks: true;
    applications: true;
    admissions: true;
    documents: true;
    partnerReferral: { include: { partner: true } };
  };
}>;

export async function getLeadsForInstitution(institutionId?: string | null, search?: string) {
  if (!institutionId) return [];

  return prisma.lead.findMany({
    where: {
      institutionId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: {
      interestedCourse: true,
      preferredBatch: true,
      source: true,
      campaign: true,
      assignedExecutive: true,
      activities: { orderBy: { createdAt: "desc" }, take: 6 },
      followUps: { orderBy: { scheduledAt: "asc" }, take: 4 },
      tasks: { orderBy: { deadline: "asc" }, take: 4 },
      applications: true,
      admissions: true,
      documents: true,
      partnerReferral: { include: { partner: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getLeadDashboard(institutionId?: string | null) {
  const leads = await getLeadsForInstitution(institutionId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const followUps = leads.flatMap((lead) => lead.followUps);

  return {
    leads,
    todaysLeads: leads.filter((lead) => lead.createdAt >= today),
    todaysFollowUps: followUps.filter((followUp) => followUp.scheduledAt >= today && followUp.scheduledAt < tomorrow && followUp.status === "PENDING"),
    newApplications: leads.flatMap((lead) => lead.applications).filter((application) => application.status === "SUBMITTED"),
    pendingAdmissions: leads.flatMap((lead) => lead.admissions).filter((admission) => admission.status === "PENDING"),
    monthlyTarget: 100,
    conversionRate: leads.length ? Math.round((leads.filter((lead) => lead.stage === "ENROLLED" || lead.stage === "STUDENT_CREATED").length / leads.length) * 100) : 0
  };
}
