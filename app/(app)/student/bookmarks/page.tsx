import { auth } from "@/auth";
import { SavedItemsPage } from "@/features/student-ai/components/student-learning-pages";
import { getStudentAIHome } from "@/services/student-ai-learning-service";

export default async function StudentBookmarksPage() {
  const session = await auth();
  const data = await getStudentAIHome({ userId: session?.user.id, institutionId: session?.user.institutionId });
  const aiBookmarks = data.preferences.favoriteItems.filter((item) => item.type === "student-ai-bookmark").map((item) => item.title);
  const learningBookmarks = data.bookmarks.map((item) => item.label ?? item.targetType);

  return <SavedItemsPage title="Bookmarks" type="bookmarks" items={[...aiBookmarks, ...learningBookmarks]} />;
}
