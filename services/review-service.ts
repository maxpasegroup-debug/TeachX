import { prisma } from "@/lib/db";

export async function getApprovalQueues(institutionId?: string | null) {
  if (!institutionId) return { videoEditorQueue: [], academicHeadQueue: [], recentlyPublished: [] };

  const [videoEditorQueue, academicHeadQueue, recentlyPublished] = await Promise.all([
    prisma.contentItem.findMany({
      where: { institutionId, status: { in: ["SUBMITTED", "VIDEO_REVIEW", "NEEDS_CHANGES"] } },
      include: { course: true, subject: true, topic: true, createdBy: true, reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" }, take: 2 } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.contentItem.findMany({
      where: { institutionId, status: "ACADEMIC_APPROVAL" },
      include: { course: true, subject: true, topic: true, createdBy: true, approvals: { include: { approver: true }, orderBy: { createdAt: "desc" }, take: 2 } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.contentItem.findMany({
      where: { institutionId, status: "PUBLISHED" },
      include: { course: true, subject: true, topic: true, createdBy: true },
      orderBy: { publishedAt: "desc" },
      take: 8
    })
  ]);

  return { videoEditorQueue, academicHeadQueue, recentlyPublished };
}

export async function reviewContent(input: { itemId: string; reviewerId?: string; decision: "APPROVED" | "REJECTED" | "RETURNED" | "NEEDS_CHANGES"; notes?: string }) {
  const nextStatus = input.decision === "APPROVED" ? "ACADEMIC_APPROVAL" : input.decision === "REJECTED" ? "REJECTED" : "NEEDS_CHANGES";

  return prisma.$transaction([
    prisma.contentReview.create({
      data: {
        itemId: input.itemId,
        reviewerId: input.reviewerId,
        stage: "Video Editor Review",
        decision: input.decision,
        notes: input.notes
      }
    }),
    prisma.contentItem.update({ where: { id: input.itemId }, data: { status: nextStatus } })
  ]);
}

export async function approveContent(input: { itemId: string; approverId?: string; decision: "APPROVED" | "REJECTED" | "RETURNED" | "NEEDS_CHANGES"; notes?: string }) {
  const nextStatus = input.decision === "APPROVED" ? "APPROVED" : input.decision === "REJECTED" ? "REJECTED" : "NEEDS_CHANGES";

  return prisma.$transaction([
    prisma.contentApproval.create({
      data: {
        itemId: input.itemId,
        approverId: input.approverId,
        decision: input.decision,
        notes: input.notes
      }
    }),
    prisma.contentItem.update({ where: { id: input.itemId }, data: { status: nextStatus } })
  ]);
}
