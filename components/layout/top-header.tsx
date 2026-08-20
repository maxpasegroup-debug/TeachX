import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { EmailVerificationReminder } from "@/components/layout/email-verification-reminder";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { ProfileMenu } from "@/components/layout/profile-menu";
import type { RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { getRecentNotifications } from "@/services/notification-service";

export async function TopHeader({ institutionName, roles }: { institutionName: string; roles: RoleKey[] }) {
  const session = await auth();
  const [notifications, user] = await Promise.all([
    getRecentNotifications(session?.user.id),
    session?.user.id ? prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, emailVerifiedAt: true, phoneVerifiedAt: true } }) : null
  ]);

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        {user && !user.emailVerifiedAt && !user.phoneVerifiedAt && !user.email.endsWith("@accounts.teachx.invalid") ? <EmailVerificationReminder /> : null}
        <MobileNavigation institutionName={institutionName} roles={roles} />
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-3">
        <NotificationMenu notifications={notifications} />
        <ProfileMenu email={session?.user.email} name={session?.user.name} teacher={roles.some((role) => ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR", "ACADEMIC_HEAD"].includes(role))} />
      </div>
    </header>
  );
}
