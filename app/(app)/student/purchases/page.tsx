import { auth } from "@/auth";
import { StudentCommerceDashboard } from "@/features/commerce/components/commerce-components";
import { getStudentCommerceDashboard } from "@/services/commerce-service";

export default async function StudentPurchasesPage() {
  const session = await auth();
  const data = await getStudentCommerceDashboard(session?.user.id, session?.user.institutionId);

  return <StudentCommerceDashboard data={data} />;
}
