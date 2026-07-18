import { auth } from "@/auth";
import { CommunicationCommunityOS } from "@/features/community/components/community-os";
import { getCommunityOS } from "@/services/community-service";

export default async function CommunicationPage() {
  const session = await auth();
  const data = await getCommunityOS({ userId: session?.user.id, institutionId: session?.user.institutionId, roles: session?.user.roles });

  return <CommunicationCommunityOS data={data} />;
}
