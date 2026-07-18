import { auth } from "@/auth";
import { StudentResourceDashboard } from "@/features/learning-marketplace/components/learning-marketplace-components";
import { getStudentResourceDashboard } from "@/services/learning-marketplace-service";

export default async function StudentResourcesPage() {
  const session = await auth();
  const data = await getStudentResourceDashboard(session?.user.id, session?.user.institutionId);

  return <StudentResourceDashboard data={data} />;
}
