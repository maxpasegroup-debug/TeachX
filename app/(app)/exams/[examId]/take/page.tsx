import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ExamTakePage } from "@/features/exams/components/exam-take-page";
import { getExamForStudent } from "@/services/exam-service";

export default async function TakeExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const session = await auth();
  const { examId } = await params;
  const exam = await getExamForStudent(examId, session?.user.id);
  if (!exam) notFound();
  return <ExamTakePage exam={exam as never} />;
}
