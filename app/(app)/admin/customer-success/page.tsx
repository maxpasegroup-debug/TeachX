import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CustomerSuccessOS } from "@/features/adminx/components/customer-success-os";
import { getAdminCustomerSuccessData } from "@/services/admin-customer-success-service";

export default async function CustomerSuccessPage() {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN")) redirect("/dashboard");
  return <CustomerSuccessOS data={await getAdminCustomerSuccessData(session.user.id)} />;
}
