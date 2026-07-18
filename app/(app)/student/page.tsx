import { auth } from "@/auth";
import { StudentAIHome } from "@/features/student-ai/components/student-ai-home";
import { getStudentAIHome } from "@/services/student-ai-learning-service";

export default async function StudentHomePage() {
  const session = await auth();
  const data = await getStudentAIHome({
    userId: session?.user.id,
    institutionId: session?.user.institutionId
  });

  return <StudentAIHome name={session?.user.name} data={data} />;
}
