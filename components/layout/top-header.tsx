import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { ProfileMenu } from "@/components/layout/profile-menu";
import type { RoleKey } from "@/lib/constants/roles";
import { getRecentNotifications } from "@/services/notification-service";

export async function TopHeader({ institutionName, roles }: { institutionName: string; roles: RoleKey[] }) {
  const session = await auth();
  const notifications = await getRecentNotifications(session?.user.id);

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <MobileNavigation institutionName={institutionName} roles={roles} />
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-3">
        <NotificationMenu notifications={notifications} />
        <ProfileMenu email={session?.user.email} name={session?.user.name} />
      </div>
    </header>
  );
}
