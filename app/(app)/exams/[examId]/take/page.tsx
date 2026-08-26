import { notFound } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { ExamTakePage } from "@/features/exams/components/exam-take-page";
import { getExamForStudent } from "@/services/exam-service";

export default async function TakeExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const user = await requireCurrentUser("exams.attempt");
  const { examId } = await params;
  const exam = await getExamForStudent(examId, user.id);
  if (!exam) notFound();
  return <ExamTakePage exam={exam as never} />;
}
