import { prisma } from "@/lib/db";

export async function getCampusOperations(input: { institutionId?: string | null }) {
  if (!input.institutionId) return emptyCampusOperations;
  const institutionId = input.institutionId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [visitors, sessions, activity, notifications, audits] = await Promise.all([
    prisma.visitor.findMany({ where: { institutionId }, orderBy: { visitedAt: "desc" }, take: 40, select: { id: true, name: true, phone: true, purpose: true, status: true, remarks: true, visitedAt: true } }),
    prisma.attendanceSession.findMany({ where: { classroom: { institutionId }, savedAt: { not: null } }, orderBy: { date: "desc" }, take: 60, select: { id: true, date: true, remarks: true, classroom: { select: { title: true, batch: { select: { name: true } } }, }, records: { select: { status: true } } } }),
    prisma.activityEvent.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, title: true, body: true, entity: true, status: true, createdAt: true } }),
    prisma.notification.findMany({ where: { institutionId, status: "UNREAD" }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, title: true, body: true, link: true, createdAt: true } }),
    prisma.auditLog.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, action: true, entity: true, message: true, createdAt: true } })
  ]);

  const todaySessions = sessions.filter((session) => session.date >= today);
  const records = todaySessions.flatMap((session) => session.records);
  const present = records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
  const activeVisitors = visitors.filter((visitor) => visitor.visitedAt >= today);

  return {
    hasInstitution: true,
    summary: {
      attendanceRate: records.length ? Math.round((present / records.length) * 100) : null,
      sessionsToday: todaySessions.length,
      visitorsToday: activeVisitors.length,
      criticalAlerts: notifications.length,
      health: records.length || activeVisitors.length || activity.length ? "Monitoring" : "Awaiting operational evidence"
    },
    visitors: visitors.map((visitor) => ({ ...visitor, visitedAt: visitor.visitedAt.toISOString() })),
    attendance: sessions.map((session) => ({ id: session.id, date: session.date.toISOString(), remarks: session.remarks, classroom: session.classroom.title, batch: session.classroom.batch.name, total: session.records.length, present: session.records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length })),
    activity: activity.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    notifications: notifications.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    audits: audits.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))
  };
}

const emptyCampusOperations = {
  hasInstitution: false,
  summary: { attendanceRate: null, sessionsToday: 0, visitorsToday: 0, criticalAlerts: 0, health: "Institution context required" },
  visitors: [], attendance: [], activity: [], notifications: [], audits: []
};
