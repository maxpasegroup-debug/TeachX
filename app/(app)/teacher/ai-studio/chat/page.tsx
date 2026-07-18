import { auth } from "@/auth";
import { AIChatPage } from "@/features/ai-studio/components/ai-chat-page";
import { getAIHistory } from "@/services/ai-studio-service";

export default async function AIStudioChatPage() {
  const session = await auth();
  const chats = await getAIHistory(session?.user.id);

  return <AIChatPage chats={chats.map((chat) => ({ id: chat.id, title: chat.title, updatedAt: chat.updatedAt, messages: chat.messages }))} />;
}
