import { notFound } from "next/navigation";

import { GenerationWorkflow } from "@/features/ai-studio/components/generation-workflow";
import { aiStudioTools, getAIStudioTool } from "@/services/ai-studio-service";

export default async function AIStudioCreatePage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  if (!aiStudioTools.some((tool) => tool.slug === slug)) notFound();

  return <GenerationWorkflow tool={getAIStudioTool(slug)} />;
}
