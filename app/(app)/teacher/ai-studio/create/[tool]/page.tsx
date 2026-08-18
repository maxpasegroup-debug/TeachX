import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { GenerationWorkflow } from "@/features/ai-studio/components/generation-workflow";
import { prisma } from "@/lib/db";
import { aiStudioTools, getAIStudioTool } from "@/services/ai-studio-service";

export default async function AIStudioCreatePage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  if (!aiStudioTools.some((tool) => tool.slug === slug)) notFound();
  const session = await auth();
  const courses = session?.user.institutionId ? await prisma.course.findMany({
    where: { institutionId: session.user.institutionId, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  }) : [];

  return <GenerationWorkflow courses={courses} tool={getAIStudioTool(slug)} />;
}
