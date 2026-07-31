import { auth } from "@/auth";
import { getDirectorAdmissionsIntelligence } from "@/services/director-admissions-intelligence-service";
import { AdmissionsCommandCenter } from "./workspace";

export default async function DirectorAdmissionsPage() {
  const session = await auth();
  return <AdmissionsCommandCenter data={await getDirectorAdmissionsIntelligence({ institutionId: session?.user.institutionId })} />;
}
