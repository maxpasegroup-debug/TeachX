import { auth } from "@/auth";
import { CampusOperationsCenter } from "@/features/campus/components/campus-operations-center";
import { getCampusOperations } from "@/services/campus-operations-service";

const campusModules = new Set(["overview", "attendance", "visitors", "transport", "hostel", "library", "maintenance", "inventory", "security", "settings"]);

export default async function CampusPage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const session = await auth();
  const { module } = await searchParams;
  const data = await getCampusOperations({ institutionId: session?.user.institutionId });
  return <CampusOperationsCenter data={data} initialModule={module && campusModules.has(module) ? module : "overview"} institutionName={"Campus"} />;
}
