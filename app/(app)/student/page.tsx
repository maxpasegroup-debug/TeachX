import { auth } from "@/auth";
import { StudentAIHome } from "@/features/student-ai/components/student-ai-home";
import { getStudentAIHome } from "@/services/student-ai-learning-service";
import { getStudentOperatingHome } from "@/services/teachx-operating-service";

export default async function StudentHomePage() {
  const session = await auth();
  const input = {
    userId: session?.user.id,
    institutionId: session?.user.institutionId
  };
  const [data, operatingHome] = await Promise.all([getStudentAIHome(input), getStudentOperatingHome(input)]);

  return <StudentAIHome name={session?.user.name} data={data} profileCompletion={operatingHome.completion} />;
}
