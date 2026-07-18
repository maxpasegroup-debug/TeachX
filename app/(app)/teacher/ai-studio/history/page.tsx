import { auth } from "@/auth";
import { AIHistoryPage } from "@/features/ai-studio/components/ai-history-page";
import { getAIHistory } from "@/services/ai-studio-service";

export default async function AIStudioHistoryPage() {
  const session = await auth();
  const items = await getAIHistory(session?.user.id);

  return <AIHistoryPage items={items} />;
}
