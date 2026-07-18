import { auth } from "@/auth";
import { PromptLibraryPage } from "@/features/ai-studio/components/prompt-library-page";
import { getPromptLibrary } from "@/services/ai-studio-service";

export default async function AIStudioPromptsPage() {
  const session = await auth();
  const templates = await getPromptLibrary(session?.user.institutionId);

  return <PromptLibraryPage templates={templates} />;
}
