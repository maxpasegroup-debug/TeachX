import { auth } from "@/auth";
import { TeacherOperatingDashboard } from "@/features/teachx/components/operating-dashboard";
import { getTeacherOperatingHome } from "@/services/teachx-operating-service";

export default async function TeacherHomePage() {
  const session = await auth();
  const home = await getTeacherOperatingHome({
    userId: session?.user.id,
    institutionId: session?.user.institutionId,
    roles: session?.user.roles ?? []
  });

  return (
    <TeacherOperatingDashboard
      name={home.user?.name ?? session?.user.name}
      completion={home.completion}
      plan={home.plan}
      aiCreditsRemaining={home.aiCreditsRemaining}
      stats={home.stats}
      recentItems={home.preferences.recentItems.map((item) => ({ title: item.title, meta: item.type, href: item.link }))}
      favorites={home.preferences.favoriteItems.map((item) => ({ title: item.title, meta: item.type, href: item.link }))}
      savedSearches={home.preferences.savedSearches.map((item) => ({ title: item.name, meta: item.query, href: "/teacher/resources" }))}
      notifications={home.notifications.map((item) => ({ title: item.title, meta: item.body, href: item.link }))}
    />
  );
}
