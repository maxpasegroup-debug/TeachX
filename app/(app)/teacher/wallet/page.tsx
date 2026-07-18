import { auth } from "@/auth";
import { TeacherCommerceDashboard } from "@/features/commerce/components/commerce-components";
import { getTeacherCommerceDashboard } from "@/services/commerce-service";

export default async function TeacherWalletPage() {
  const session = await auth();
  const data = await getTeacherCommerceDashboard(session?.user.id, session?.user.institutionId);

  return <TeacherCommerceDashboard data={data} />;
}
