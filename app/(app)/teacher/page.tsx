import { auth } from "@/auth";
import { GuruHome } from "@/features/teachx/components/guru-home";
import { getTeacherOperatingHome } from "@/services/teachx-operating-service";

export default async function TeacherHomePage() {
  const session = await auth();
  const home = await getTeacherOperatingHome({
    userId: session?.user.id,
    institutionId: session?.user.institutionId,
    roles: session?.user.roles ?? []
  });

  return (
    <GuruHome
      name={home.user?.name ?? session?.user.name}
      aiCreditsRemaining={home.aiCreditsRemaining}
      stats={home.stats}
      daily={home.daily}
    />
  );
}
