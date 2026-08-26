import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";
import { userHasPermission } from "@/lib/rbac";

export type UniversalSearchResult = {
  type: string;
  title: string;
  subtitle?: string;
  href: string;
};

export async function universalSearch(institutionId: string, query: string, userId?: string, roles: RoleKey[] = []): Promise<UniversalSearchResult[]> {
  const contains = { contains: query, mode: "insensitive" as const };
  const canSeePeople = userHasPermission(roles, "people.view");
  const canSeeSupport = userHasPermission(roles, "settings.manage");
  const canSeeFinance = userHasPermission(roles, "finance.view");
  const canSeeAdmissions = userHasPermission(roles, "admissions.view");
  const canSeeAdministration = roles.includes("ADMIN") || userHasPermission(roles, "settings.manage");
  const [students, teachers, marketplaceTeachers, learningResources, announcements, conversations, messages, discussions, communities, promptTemplates, supportTickets, commerceOrders, featureFlags, auditLogs, courses, batches, exams, content, leads, invoices, receipts, partners, assignments, attendance, aiOutputs, notes, institutions] = await Promise.all([
    canSeePeople ? prisma.user.findMany({ where: { institutionId, name: contains, roles: { some: { role: { key: "STUDENT" } } } }, take: 6 }) : Promise.resolve([]),
    canSeePeople ? prisma.user.findMany({ where: { institutionId, name: contains, roles: { some: { role: { key: { in: ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } } }, take: 6 }) : Promise.resolve([]),
    prisma.teacherProfile.findMany({ where: { isMarketplaceListed: true, OR: [{ user: { institutionId, name: contains } }, { headline: contains }, { bio: contains }, { location: contains }] }, include: { user: true }, take: 6 }),
    prisma.contentItem.findMany({
      where: {
        institutionId,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        OR: [{ title: contains }, { description: contains }, { course: { name: contains } }, { subject: { name: contains } }, { createdBy: { name: contains } }]
      },
      include: { course: true, subject: true, createdBy: true },
      take: 6
    }),
    prisma.communication.findMany({ where: { institutionId, kind: "ANNOUNCEMENT", OR: [{ title: contains }, { body: contains }] }, take: 6 }),
    userId ? prisma.directConversation.findMany({ where: { institutionId, participants: { some: { userId } }, title: contains }, take: 6 }) : Promise.resolve([]),
    userId ? prisma.directMessage.findMany({ where: { conversation: { institutionId, participants: { some: { userId } } }, body: contains }, include: { conversation: true }, take: 6 }) : Promise.resolve([]),
    prisma.genericDiscussion.findMany({
      where: {
        institutionId,
        AND: [
          { OR: [{ title: contains }, { body: contains }] },
          { OR: [{ communityId: null }, { community: { visibility: "PUBLIC" } }, ...(userId ? [{ community: { members: { some: { userId } } } }] : [])] }
        ]
      }, take: 6
    }),
    prisma.community.findMany({
      where: {
        institutionId,
        AND: [
          { OR: [{ name: contains }, { description: contains }] },
          { OR: [{ visibility: "PUBLIC" }, ...(userId ? [{ members: { some: { userId } } }] : [])] }
        ]
      }, take: 6
    }),
    prisma.promptTemplate.findMany({ where: { AND: [{ OR: [{ institutionId }, { institutionId: null }] }, { OR: [{ name: contains }, { key: contains }] }] }, take: 6 }),
    canSeeSupport ? prisma.supportTicket.findMany({ where: { institutionId, OR: [{ subject: contains }, { body: contains }] }, take: 6 }) : Promise.resolve([]),
    canSeeFinance ? prisma.commerceOrder.findMany({ where: { institutionId, OR: [{ gatewayOrderId: contains }, { buyer: { name: contains } }] }, include: { buyer: true }, take: 6 }) : Promise.resolve([]),
    canSeeAdministration ? prisma.featureFlag.findMany({ where: { AND: [{ OR: [{ institutionId }, { institutionId: null }] }, { OR: [{ key: contains }, { name: contains }] }] }, take: 6 }) : Promise.resolve([]),
    canSeeAdministration ? prisma.auditLog.findMany({ where: { institutionId, OR: [{ entity: contains }, { message: contains }] }, include: { actor: true }, take: 6 }) : Promise.resolve([]),
    prisma.course.findMany({ where: { institutionId, name: contains }, take: 6 }),
    prisma.batch.findMany({ where: { name: contains, course: { institutionId } }, include: { course: true }, take: 6 }),
    prisma.exam.findMany({ where: { institutionId, name: contains }, include: { course: true }, take: 6 }),
    prisma.contentItem.findMany({ where: { institutionId, title: contains }, include: { course: true }, take: 6 }),
    canSeeAdmissions ? prisma.lead.findMany({ where: { institutionId, name: contains }, take: 6 }) : Promise.resolve([]),
    canSeeFinance ? prisma.invoice.findMany({ where: { institutionId, invoiceNumber: contains }, include: { student: true }, take: 6 }) : Promise.resolve([]),
    canSeeFinance ? prisma.receipt.findMany({ where: { institutionId, receiptNumber: contains }, include: { payment: { include: { student: true } } }, take: 6 }) : Promise.resolve([]),
    prisma.partner.findMany({ where: { institutionId, name: contains }, take: 6 }),
    prisma.assignment.findMany({ where: { title: contains, classroom: { institutionId } }, include: { classroom: true }, take: 6 }),
    prisma.attendanceSession.findMany({ where: { classroom: { institutionId, title: contains } }, include: { classroom: true, batch: true }, take: 6 })
    ,
    userId ? prisma.aIConversation.findMany({ where: { userId, institutionId, scope: "TEACHER", title: contains }, take: 12 }) : Promise.resolve([]),
    userId ? prisma.userPreference.findMany({ where: { userId, key: { startsWith: "teacher-note:" }, value: { path: ["title"], string_contains: query } }, take: 12 }) : Promise.resolve([]),
    prisma.institution.findMany({ where: { id: institutionId, OR: [{ name: contains }, { address: contains }, { email: contains }] }, take: 6 })
  ]);

  return [
    ...students.map((item) => ({ type: "Student", title: item.name, subtitle: item.email, href: "/people" })),
    ...teachers.map((item) => ({ type: "Teacher", title: item.name, subtitle: item.email, href: "/staff" })),
    ...marketplaceTeachers.map((item) => ({ type: "Marketplace Teacher", title: item.user.name, subtitle: item.headline ?? item.subjects.join(", "), href: `/marketplace/teachers/${item.id}` })),
    ...learningResources.map((item) => ({ type: "Learning Resource", title: item.title, subtitle: `${item.subject?.name ?? item.course.name}${item.createdBy?.name ? ` by ${item.createdBy.name}` : ""}`, href: `/resources/${item.id}` })),
    ...announcements.map((item) => ({ type: "Announcement", title: item.title, subtitle: item.status, href: "/communication" })),
    ...conversations.map((item) => ({ type: "Message Thread", title: item.title, subtitle: item.status, href: "/communication" })),
    ...messages.map((item) => ({ type: "Message", title: item.conversation.title, subtitle: item.body, href: "/communication" })),
    ...discussions.map((item) => ({ type: "Discussion", title: item.title, subtitle: item.scope, href: "/communication" })),
    ...communities.map((item) => ({ type: "Community", title: item.name, subtitle: item.type, href: "/communication" })),
    ...promptTemplates.map((item) => ({ type: "Prompt Template", title: item.name, subtitle: item.scope, href: "/admin/content-management" })),
    ...supportTickets.map((item) => ({ type: "Support Ticket", title: item.subject, subtitle: item.status, href: "/admin/support" })),
    ...commerceOrders.map((item) => ({ type: "Order", title: item.type.replaceAll("_", " "), subtitle: `${item.buyer.name} - ${item.status}`, href: "/admin/orders" })),
    ...featureFlags.map((item) => ({ type: "Feature Flag", title: item.name, subtitle: item.enabled ? "Enabled" : "Disabled", href: "/admin/system-settings" })),
    ...auditLogs.map((item) => ({ type: "Audit Log", title: item.message ?? `${item.action} ${item.entity}`, subtitle: item.actor?.name ?? "System", href: "/admin/audit-log" })),
    ...courses.map((item) => ({ type: "Course", title: item.name, subtitle: item.code, href: "/courses" })),
    ...batches.map((item) => ({ type: "Batch", title: item.name, subtitle: item.course.name, href: "/batches" })),
    ...exams.map((item) => ({ type: "Exam", title: item.name, subtitle: item.course.name, href: "/exams" })),
    ...content.map((item) => ({ type: "Content", title: item.title, subtitle: item.course.name, href: "/content-studio" })),
    ...leads.map((item) => ({ type: "Lead", title: item.name, subtitle: item.phone ?? item.email ?? undefined, href: "/admissions" })),
    ...invoices.map((item) => ({ type: "Invoice", title: item.invoiceNumber, subtitle: item.student.name, href: "/finance" })),
    ...receipts.map((item) => ({ type: "Receipt", title: item.receiptNumber, subtitle: item.payment.student.name, href: "/finance" })),
    ...partners.map((item) => ({ type: "Partner", title: item.name, subtitle: item.referralCode, href: "/partners" })),
    ...assignments.map((item) => ({ type: "Assignment", title: item.title, subtitle: item.classroom.title, href: `/classrooms/${item.classroomId}` })),
    ...attendance.map((item) => ({ type: "Attendance", title: item.classroom.title, subtitle: item.batch.name, href: `/classrooms/${item.classroomId}` }))
    ,
    ...aiOutputs.map((item) => {
      const context = item.context && typeof item.context === "object" && !Array.isArray(item.context) ? item.context as Record<string, unknown> : {};
      const tool = String(context.toolSlug ?? "AI Output");
      return { type: tool.replaceAll("-", " "), title: item.title, subtitle: "Saved AI teaching material", href: "/teacher/workspace/saved-ai" };
    }),
    ...notes.map((item) => {
      const note = item.value && typeof item.value === "object" && !Array.isArray(item.value) ? item.value as Record<string, unknown> : {};
      return { type: "Note", title: String(note.title ?? "Teaching note"), subtitle: String(note.kind ?? "Teacher workspace"), href: "/teacher/workspace/notes" };
    }),
    ...institutions.map((item) => ({ type: "Institution", title: item.name, subtitle: item.address ?? item.email ?? undefined, href: "/institution/dashboard" }))
  ];
}

export async function saveSearch(userId: string, name: string, query: string, scope?: string) {
  return prisma.savedSearch.create({ data: { userId, name, query, scope } });
}
