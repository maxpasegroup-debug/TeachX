import { auth } from "@/auth";
import { StudentMarketplaceDashboard } from "@/features/marketplace/components/marketplace-components";
import { getStudentMarketplaceDashboard } from "@/services/marketplace-service";

export default async function StudentTeachersPage() {
  const session = await auth();
  const data = await getStudentMarketplaceDashboard(session?.user.id);

  return <StudentMarketplaceDashboard data={data} />;
}
