import { auth } from "@/auth";
import { ProgressAnalyticsPage } from "@/features/student-ai/components/student-learning-pages";
import { getStudentAIHome } from "@/services/student-ai-learning-service";

export default async function StudentProgressPage() {
  const session = await auth();
  const data = await getStudentAIHome({ userId: session?.user.id, institutionId: session?.user.institutionId });

  return <ProgressAnalyticsPage mastered={data.progress.masteredTopics} weak={data.progress.weakAreas} streak={data.progress.studyStreak} />;
}
