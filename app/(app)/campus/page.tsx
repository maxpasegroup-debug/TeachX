import { auth } from "@/auth";
import { CampusOperationsCenter } from "@/features/campus/components/campus-operations-center";
import { getCampusOperations } from "@/services/campus-operations-service";

export default async function CampusPage() {
  const session = await auth();
  const data = await getCampusOperations({ institutionId: session?.user.institutionId });
  return <CampusOperationsCenter data={data} institutionName={"Campus"} />;
}
