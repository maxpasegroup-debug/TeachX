import { prisma } from "@/lib/db";

export type StudentFoundation = {
  profile: Record<string, unknown>;
  personalization: Record<string, unknown>;
  settings: Record<string, unknown>;
  goals: Array<{ id: string; type: string; title: string; targetDate?: string; completed?: boolean }>;
  institutionRequest: { institutionId: string; institutionName: string; status: string } | null;
};

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export async function getStudentFoundation(userId?: string) {
  if (!userId) return null;
  const [user, preferences, institutions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        studentProfile: true,
        institution: { select: { id: true, name: true, logoUrl: true } },
        childLinks: { include: { parent: { select: { id: true, name: true, email: true, profile: { select: { phone: true } } } } } },
        accounts: { select: { id: true, provider: true, type: true } }
      }
    }),
    prisma.userPreference.findMany({ where: { userId, key: { startsWith: "learnx." } } }),
    prisma.institution.findMany({ select: { id: true, name: true, address: true, logoUrl: true }, orderBy: { name: "asc" }, take: 100 })
  ]);
  if (!user) return null;
  const map = new Map(preferences.map((item) => [item.key, item.value]));
  const goals = Array.isArray(map.get("learnx.goals")) ? (map.get("learnx.goals") as StudentFoundation["goals"]) : [];
  return {
    user: { name: user.name, email: user.email, emailVerified: Boolean(user.emailVerifiedAt), status: user.status },
    baseProfile: user.profile,
    studentProfile: user.studentProfile,
    institution: user.institution,
    parents: user.childLinks.map((link) => ({ id: link.id, parentId: link.parent.id, relation: link.relation, isPrimary: link.isPrimary, name: link.parent.name, email: link.parent.email, phone: link.parent.profile?.phone })),
    parentInvitations: Array.isArray(map.get("learnx.parent-invitations")) ? map.get("learnx.parent-invitations") as Array<{ id: string; parentId: string; email: string; name: string; relation: string; isPrimary: boolean; status: string }> : [],
    accounts: user.accounts,
    institutions,
    foundation: {
      profile: objectValue(map.get("learnx.profile")),
      personalization: objectValue(map.get("learnx.personalization")),
      settings: objectValue(map.get("learnx.settings")),
      goals,
      institutionRequest: (map.get("learnx.institution-request") as StudentFoundation["institutionRequest"]) ?? null
    },
    onboardingComplete: user.studentProfile?.onboardingStep === "complete"
  };
}
