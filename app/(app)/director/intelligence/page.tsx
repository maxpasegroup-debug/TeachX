import { auth } from "@/auth";
import { getDirectorAcademicIntelligence } from "@/services/director-academic-intelligence-service";
import { AcademicIntelligenceWorkspace } from "./workspace";

export default async function AcademicIntelligencePage() {
  const session = await auth();
  const intelligence = await getDirectorAcademicIntelligence({ institutionId: session?.user.institutionId });
  return <AcademicIntelligenceWorkspace data={intelligence} />;
}
