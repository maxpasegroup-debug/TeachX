import { prisma } from "@/lib/db";

export type UniversalSearchResult = {
  type: string;
  title: string;
  subtitle?: string;
  href: string;
};

export async function universalSearch(institutionId: string, query: string, userId?: string): Promise<UniversalSearchResult[]> {
  const contains = { contains: query, mode: "insensitive" as const };
  const [students, teachers, marketplaceTeachers, learningResources, announcements, conversations, messages, discussions, communities, promptTemplates, supportTickets, commerceOrders, featureFlags, auditLogs, courses, batches, exams, content, leads, invoices, receipts, partners, assignments, attendance] = await Promise.all([
    prisma.user.findMany({ where: { institutionId, name: contains, roles: { some: { role: { key: "STUDENT" } } } }, take: 6 }),
    prisma.user.findMany({ where: { institutionId, name: contains, roles: { some: { role: { key: { in: ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } } }, take: 6 }),
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
    prisma.genericDiscussion.findMany({ where: { institutionId, OR: [{ title: contains }, { body: contains }] }, take: 6 }),
    prisma.community.findMany({ where: { institutionId, OR: [{ name: contains }, { description: contains }] }, take: 6 }),
    prisma.promptTemplate.findMany({ where: { AND: [{ OR: [{ institutionId }, { institutionId: null }] }, { OR: [{ name: contains }, { key: contains }] }] }, take: 6 }),
    prisma.supportTicket.findMany({ where: { institutionId, OR: [{ subject: contains }, { body: contains }] }, take: 6 }),
    prisma.commerceOrder.findMany({ where: { institutionId, OR: [{ gatewayOrderId: contains }, { buyer: { name: contains } }] }, include: { buyer: true }, take: 6 }),
    prisma.featureFlag.findMany({ where: { AND: [{ OR: [{ institutionId }, { institutionId: null }] }, { OR: [{ key: contains }, { name: contains }] }] }, take: 6 }),
    prisma.auditLog.findMany({ where: { institutionId, OR: [{ entity: contains }, { message: contains }] }, include: { actor: true }, take: 6 }),
    prisma.course.findMany({ where: { institutionId, name: contains }, take: 6 }),
    prisma.batch.findMany({ where: { name: contains, course: { institutionId } }, include: { course: true }, take: 6 }),
    prisma.exam.findMany({ where: { institutionId, name: contains }, include: { course: true }, take: 6 }),
    prisma.contentItem.findMany({ where: { institutionId, title: contains }, include: { course: true }, take: 6 }),
    prisma.lead.findMany({ where: { institutionId, name: contains }, take: 6 }),
    prisma.invoice.findMany({ where: { institutionId, invoiceNumber: contains }, include: { student: true }, take: 6 }),
    prisma.receipt.findMany({ where: { institutionId, receiptNumber: contains }, include: { payment: { include: { student: true } } }, take: 6 }),
    prisma.partner.findMany({ where: { institutionId, name: contains }, take: 6 }),
    prisma.assignment.findMany({ where: { title: contains, classroom: { institutionId } }, include: { classroom: true }, take: 6 }),
    prisma.attendanceSession.findMany({ where: { classroom: { institutionId, title: contains } }, include: { classroom: true, batch: true }, take: 6 })
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
  ];
}

export async function saveSearch(userId: string, name: string, query: string, scope?: string) {
  return prisma.savedSearch.create({ data: { userId, name, query, scope } });
}
