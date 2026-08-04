import { auth } from "@/auth";
import { StudentDailyHome } from "@/features/student-dashboard/components/student-daily-home";
import { getStudentDashboard } from "@/services/student-dashboard-service";

export default async function StudentHomePage() {
  const session = await auth();
  const data = await getStudentDashboard({
    userId: session?.user.id,
    institutionId: session?.user.institutionId
  });
  return <StudentDailyHome name={session?.user.name} data={data} />;
}
