import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { ReceptionBoard } from "@/features/reception/components/reception-board";
import { getReceptionOverview } from "@/services/reception-service";

export default async function ReceptionPage() {
  const session = await auth();
  const overview = await getReceptionOverview(session?.user.institutionId);

  return (
    <>
      <PageHeader description="Handle visitors, walk-in enquiries, appointments, document collection and receipt hand-offs from one calm desk." eyebrow="Front office" title="Reception" />
      <ReceptionBoard overview={overview} />
    </>
  );
}
