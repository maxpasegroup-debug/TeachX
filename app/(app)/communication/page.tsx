import { CommunicationCommunityOS } from "@/features/community/components/community-os";
import { getCommunityOS } from "@/services/community-service";

export default async function CommunicationPage({ searchParams }: { searchParams: Promise<{ notificationQuery?: string }> }) {
  const { notificationQuery } = await searchParams;
  const data = await getCommunityOS(notificationQuery);

  return <CommunicationCommunityOS data={data} />;
}
