import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MarketXWorkspace } from "@/features/marketx/components/marketx-workspace";
import { getMarketXData } from "@/services/marketx-service";

export default async function MarketXPage() {
  const session = await auth();
  if (!session?.user.id) redirect("/login");
  return <MarketXWorkspace data={await getMarketXData({ userId: session.user.id, institutionId: session.user.institutionId })} />;
}
