import { StudentAITutor } from "@/features/student-ai/components/student-ai-tutor";

export default async function StudentAskAIPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const params = await searchParams;
  return <StudentAITutor defaultMode={params.mode ?? "Explain"} />;
}
