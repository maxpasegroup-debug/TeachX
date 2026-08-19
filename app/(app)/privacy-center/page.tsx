import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrivacyCenter } from "@/features/privacy/components/privacy-center";
import { getUserPrivacyCenter } from "@/services/privacy-service";

export const dynamic = "force-dynamic";

export default async function PrivacyCenterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/privacy-center");
  return <PrivacyCenter data={JSON.parse(JSON.stringify(await getUserPrivacyCenter(session.user.id)))} />;
}
