import { auth } from "@/auth";
import { getDirectorDashboard } from "@/services/director-dashboard-service";
import { DirectorCommandCenter } from "./director-command-center";
export default async function DirectorPage() { const session = await auth(); const dashboard = await getDirectorDashboard(session?.user.institutionId); return <DirectorCommandCenter dashboard={dashboard} directorName={session?.user.name ?? "Director"} />; }
