import { auth } from "@/auth";
import { StudentAIWorkspace } from "@/features/student-ai/components/student-ai-workspace";
import { getStudentAIWorkspace } from "@/services/student-ai-learning-service";
export default async function Page({ searchParams }: { searchParams: Promise<{ module?: string }> }) { const session = await auth(); const params = await searchParams; return <StudentAIWorkspace data={await getStudentAIWorkspace(session?.user.id)} initialModule={params.module} />; }
