import { auth } from "@/auth";
import { SavedItemsPage } from "@/features/student-ai/components/student-learning-pages";
import { getStudentAIHome } from "@/services/student-ai-learning-service";

export default async function StudentDownloadsPage() {
  const session = await auth();
  const data = await getStudentAIHome({ userId: session?.user.id, institutionId: session?.user.institutionId });

  return <SavedItemsPage title="Downloads" type="downloads" items={data.downloads.map((item) => item.item.title)} />;
}
