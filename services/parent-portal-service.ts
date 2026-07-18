import { prisma } from "@/lib/db";
import { getStudentHome } from "@/services/learning-service";
import { getAvailableStudentExams } from "@/services/exam-service";

export async function getParentPortal(parentId?: string, institutionId?: string | null) {
  if (!parentId || !institutionId) return { children: [], selectedChild: null, learning: null, fees: [], exams: [], results: [], communications: [] };

  const children = await prisma.parentChildRelation.findMany({ where: { parentId }, include: { child: true }, orderBy: { isPrimary: "desc" } });
  const selectedChild = children[0]?.child ?? null;
  if (!selectedChild) return { children, selectedChild: null, learning: null, fees: [], exams: [], results: [], communications: [] };

  const [learning, fees, exams, results, communications] = await Promise.all([
    getStudentHome(selectedChild.id, institutionId),
    prisma.studentFee.findMany({ where: { institutionId, studentId: selectedChild.id }, include: { feeHead: true, payments: true }, orderBy: { dueDate: "asc" } }),
    getAvailableStudentExams(selectedChild.id),
    prisma.examResult.findMany({ where: { studentId: selectedChild.id }, include: { exam: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.communicationRecipient.findMany({ where: { userId: parentId }, include: { communication: true }, orderBy: { createdAt: "desc" }, take: 8 })
  ]);

  return { children, selectedChild, learning, fees, exams, results, communications };
}
