import { prisma } from "@/lib/db";

/** Read-only shared projection for the authenticated person and institution. */
export async function getEduXCloudData(input: { userId: string; institutionId?: string | null }) {
  const institutionId = input.institutionId ?? undefined;
  const institutionScope = institutionId ? { institutionId } : {};
  const [user, notifications, conversations, preferences, recents, favorites, documents, activities, peers, usage] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.userId }, select: { id: true, name: true, email: true, userType: true, status: true, lastLoginAt: true, institution: { select: { id: true, name: true } }, roles: { select: { role: { select: { name: true } } } }, profile: { select: { avatarUrl: true, title: true, bio: true } } } }),
    prisma.notification.findMany({ where: { OR: [{ userId: input.userId }, ...(institutionId ? [{ institutionId, userId: null }] : [])] }, select: { id: true, title: true, body: true, status: true, link: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.aIConversation.findMany({ where: { userId: input.userId, ...institutionScope }, select: { id: true, title: true, scope: true, model: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 40 }),
    prisma.userPreference.findMany({ where: { userId: input.userId }, select: { id: true, key: true, value: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.recentItem.findMany({ where: { userId: input.userId }, select: { id: true, type: true, title: true, link: true, viewedAt: true }, orderBy: { viewedAt: "desc" }, take: 20 }),
    prisma.favoriteItem.findMany({ where: { userId: input.userId }, select: { id: true, type: true, title: true, link: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    institutionId ? prisma.contentItem.findMany({ where: { institutionId, OR: [{ createdById: input.userId }, { status: "PUBLISHED" }] }, select: { id: true, title: true, description: true, type: true, mimeType: true, sizeBytes: true, fileUrl: true, externalUrl: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 50 }) : [],
    prisma.activity.findMany({ where: { OR: [{ actorId: input.userId }, ...(institutionId ? [{ institutionId }] : [])] }, select: { id: true, type: true, title: true, body: true, link: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    institutionId ? prisma.user.findMany({ where: { institutionId, id: { not: input.userId }, status: "ACTIVE" }, select: { id: true, name: true, userType: true, roles: { select: { role: { select: { name: true } } } } }, take: 20 }) : [],
    prisma.aIUsage.findMany({ where: { userId: input.userId, ...institutionScope }, select: { feature: true, totalTokens: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 365 }),
  ]);
  const timeline = [
    ...notifications.map((x) => ({ id: `notification-${x.id}`, product: "Notifications", title: x.title, detail: x.body ?? "Notification", link: x.link, at: x.createdAt })),
    ...activities.map((x) => ({ id: `activity-${x.id}`, product: String(x.type), title: x.title, detail: x.body ?? "Activity", link: x.link, at: x.createdAt })),
    ...conversations.map((x) => ({ id: `ai-${x.id}`, product: "AI", title: x.title, detail: `${x.scope} memory${x.model ? ` · ${x.model}` : ""}`, link: "/ai", at: x.updatedAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 80);
  const byFeature = Object.entries(usage.reduce<Record<string, number>>((total, row) => { total[row.feature] = (total[row.feature] ?? 0) + row.totalTokens; return total; }, {})).sort((a, b) => b[1] - a[1]);
  return { user, notifications, conversations, preferences, recents, favorites, documents, timeline, peers, analytics: { requestCount: usage.length, tokenCount: usage.reduce((sum, x) => sum + x.totalTokens, 0), byFeature }, readiness: { graph: "Relationship evidence is shown from your institution membership and current role mapping. A persisted knowledge graph is not modeled yet.", devices: "Trusted-device and session management are provided by the authentication service; a portable session registry is not currently modeled.", files: "Only resources available through existing content records are listed. Certificates, invoices, and AI attachments appear when their source services expose document records." } };
}
