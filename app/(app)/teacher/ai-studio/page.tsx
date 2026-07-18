import { auth } from "@/auth";
import { AIStudioHome } from "@/features/ai-studio/components/ai-studio-home";
import { getAIStudioHome } from "@/services/ai-studio-service";

export default async function TeacherAIStudioPage() {
  const session = await auth();
  const studio = await getAIStudioHome(session?.user.id, session?.user.institutionId);

  return (
    <AIStudioHome
      name={session?.user.name}
      credits={studio.credits}
      usage={studio.usage}
      recent={studio.conversations.map((item) => ({ id: item.id, title: item.title, updatedAt: item.updatedAt }))}
      favoriteCount={studio.preferences.favoriteItems.filter((item) => item.type.includes("ai") || item.type === "prompt").length}
    />
  );
}
