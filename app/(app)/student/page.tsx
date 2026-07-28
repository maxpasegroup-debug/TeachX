import { auth } from "@/auth";
import { StudentAIHome } from "@/features/student-ai/components/student-ai-home";
import { getStudentAIHome } from "@/services/student-ai-learning-service";
import { getStudentOperatingHome } from "@/services/teachx-operating-service";
import { getStudentFoundation } from "@/services/student-foundation-service";

export default async function StudentHomePage() {
  const session = await auth();
  const input = {
    userId: session?.user.id,
    institutionId: session?.user.institutionId
  };
  const [data, operatingHome, foundation] = await Promise.all([getStudentAIHome(input), getStudentOperatingHome(input), getStudentFoundation(session?.user.id)]);

  return <StudentAIHome name={session?.user.name} data={data} foundation={foundation} profileCompletion={operatingHome.completion} />;
}
