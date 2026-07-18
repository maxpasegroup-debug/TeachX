import type { RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { getContentAnalytics } from "@/services/content-analytics-service";
import { getApprovalQueues } from "@/services/review-service";
import { getStorageDashboard } from "@/services/storage-service";
import { getRecentActivities } from "@/services/activity-service";
import { getDirectorDashboard } from "@/services/director-dashboard-service";
import { getExpenseOverview } from "@/services/expense-service";
import { getFeeOverview } from "@/services/fee-service";
import { getInvoicesForInstitution } from "@/services/invoice-service";
import { getLeadDashboard } from "@/services/lead-service";
import { getPaymentOverview } from "@/services/payment-service";
import { getReceiptsForInstitution } from "@/services/receipt-service";
import { getReceptionOverview } from "@/services/reception-service";
import { getCalendarSummary } from "@/services/calendar-service";
import { getPlannerData } from "@/services/planner-service";
import { getTeacherDashboard } from "@/services/classroom-service";
import { getStudentHome } from "@/services/learning-service";
import { getAvailableStudentExams } from "@/services/exam-service";
import { getNotificationCenter } from "@/services/notification-aggregation-service";
import { getParentPortal } from "@/services/parent-portal-service";

export type WorkspaceKey =
  | "DIRECTOR"
  | "ACADEMIC_HEAD"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "BUSINESS_DEVELOPMENT"
  | "ACCOUNTS"
  | "RECEPTION"
  | "VIDEO_EDITOR"
  | "ADMIN";

export type WorkspaceData = {
  key: WorkspaceKey;
  title: string;
  subtitle: string;
  kpis: { label: string; value: string; href?: string }[];
  primary: { title: string; items: string[]; href?: string }[];
  quickActions: { label: string; href: string }[];
  activity: { id: string; title: string; body?: string | null; createdAt: Date; link?: string }[];
  notifications: { title: string; body?: string | null; link?: string | null }[];
};

const teacherRoles: RoleKey[] = ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export function resolveWorkspace(roles: RoleKey[] = []): WorkspaceKey {
  if (roles.includes("DIRECTOR")) return "DIRECTOR";
  if (roles.includes("ACADEMIC_HEAD")) return "ACADEMIC_HEAD";
  if (roles.some((role) => teacherRoles.includes(role))) return "TEACHER";
  if (roles.includes("STUDENT")) return "STUDENT";
  if (roles.includes("PARENT")) return "PARENT";
  if (roles.includes("BUSINESS_DEVELOPMENT_EXECUTIVE")) return "BUSINESS_DEVELOPMENT";
  if (roles.includes("ACCOUNTS")) return "ACCOUNTS";
  if (roles.includes("RECEPTION")) return "RECEPTION";
  if (roles.includes("VIDEO_EDITOR")) return "VIDEO_EDITOR";
  return "ADMIN";
}

export async function getWorkspaceData(input: { userId?: string; name?: string | null; institutionId?: string | null; roles: RoleKey[] }): Promise<WorkspaceData> {
  const workspace = resolveWorkspace(input.roles);
  const [activity, notificationCenter] = await Promise.all([
    getRecentActivities(input.institutionId, 8),
    getNotificationCenter(input.userId, input.institutionId)
  ]);
  const common = {
    activity,
    notifications: notificationCenter.recent.map((item) => ({ title: item.title, body: item.body, link: item.link }))
  };

  if (workspace === "DIRECTOR" || workspace === "ADMIN") {
    const [director, planner, leads] = await Promise.all([
      getDirectorDashboard(input.institutionId),
      getPlannerData(input.institutionId),
      getLeadDashboard(input.institutionId)
    ]);
    return {
      key: workspace,
      title: workspace === "DIRECTOR" ? "Director Command Center" : "Admin Workspace",
      subtitle: "One calm view of admissions, finance, academics, exams and operations.",
      kpis: [
        ...director.kpis.slice(0, 8),
        { label: "New Leads", value: leads.todaysLeads.length.toString(), href: "/admissions" },
        { label: "Timetable Changes", value: planner.overrides.length.toString(), href: "/classes" }
      ],
      primary: [
        { title: "Recent Activities", items: activity.map((item) => item.title) },
        { title: "Partner Performance", items: director.partnerPerformance.map((partner) => `${partner.name} - ${partner.referrals.length} referrals`), href: "/partners" },
        { title: "Outstanding Collections", items: director.pendingFees.map((fee) => `${fee.student.name} - INR ${Number(fee.amount).toLocaleString("en-IN")}`), href: "/finance" }
      ],
      quickActions: [
        { label: "View Reports", href: "/reports" },
        { label: "View Finance", href: "/finance" },
        { label: "View Academics", href: "/operations" },
        { label: "Open Planner", href: "/classes" }
      ],
      ...common
    };
  }

  if (workspace === "ACADEMIC_HEAD") {
    const [planner, calendar, queues, exams, attendance] = await Promise.all([
      getPlannerData(input.institutionId),
      getCalendarSummary(input.institutionId),
      getApprovalQueues(input.institutionId),
      prisma.exam.findMany({ where: { institutionId: input.institutionId ?? undefined }, orderBy: { startsAt: "asc" }, take: 6 }),
      prisma.attendanceSession.findMany({ where: { classroom: { institutionId: input.institutionId ?? undefined } }, include: { records: true, batch: true }, orderBy: { date: "desc" }, take: 8 })
    ]);
    return {
      key: workspace,
      title: "Academic Head Workspace",
      subtitle: "Planner, faculty, timetable changes, content approvals and exams in one place.",
      kpis: [
        { label: "Today's Planner", value: planner.entries.length.toString(), href: "/classes" },
        { label: "Timetable Changes", value: planner.overrides.length.toString(), href: "/classes" },
        { label: "Pending Content Approval", value: queues.academicHeadQueue.length.toString(), href: "/content-studio" },
        { label: "Exam Schedule", value: exams.length.toString(), href: "/exams" },
        { label: "Attendance Sessions", value: attendance.length.toString() },
        { label: "Faculty Available", value: planner.faculty.length.toString(), href: "/staff" }
      ],
      primary: [
        { title: "Today's Timetable Changes", items: planner.overrides.map((item) => item.type.replaceAll("_", " ")) },
        { title: "Upcoming Holidays", items: calendar.upcomingHolidays.map((item) => item.title), href: "/classes" },
        { title: "Batch Health", items: planner.batches.slice(0, 6).map((batch) => `${batch.name} - ${batch.course.name}`), href: "/batches" }
      ],
      quickActions: [
        { label: "Open Planner", href: "/classes" },
        { label: "Approve Content", href: "/content-studio" },
        { label: "Manage Exams", href: "/exams" },
        { label: "View Batches", href: "/batches" }
      ],
      ...common
    };
  }

  if (workspace === "TEACHER") {
    const [teacher, queues] = await Promise.all([
      getTeacherDashboard(input.userId, input.institutionId, input.roles),
      getApprovalQueues(input.institutionId)
    ]);
    return {
      key: workspace,
      title: `Teacher Workspace`,
      subtitle: "Today's classes, classrooms, attendance, assignments, content and live classes.",
      kpis: [
        { label: "Today's Classes", value: teacher.todaysClasses.length.toString(), href: "/classrooms" },
        { label: "My Classrooms", value: teacher.classrooms.length.toString(), href: "/classrooms" },
        { label: "Pending Attendance", value: teacher.pendingAttendance.length.toString(), href: "/classrooms" },
        { label: "Pending Assignments", value: teacher.assignmentsAwaitingReview.toString(), href: "/classrooms" },
        { label: "Recent Content", value: teacher.recentMaterials.length.toString(), href: "/content-studio" },
        { label: "Upcoming Live", value: teacher.upcomingLiveClasses.length.toString(), href: "/classrooms" }
      ],
      primary: [
        { title: "Today's Classes", items: teacher.todaysClasses.map(({ classroom, entry }) => `${classroom.batch.name} - ${entry.timeSlot.name} - ${entry.subject?.name ?? "Subject"}`), href: "/classrooms" },
        { title: "My Classrooms", items: teacher.classrooms.map((classroom) => `${classroom.course.name} - ${classroom.batch.name}`), href: "/classrooms" },
        { title: "Content Workflow", items: queues.videoEditorQueue.slice(0, 5).map((item) => `${item.title} - ${item.status.replaceAll("_", " ")}`), href: "/content-studio" }
      ],
      quickActions: [
        { label: "Open My Classrooms", href: "/classrooms" },
        { label: "Upload Lesson", href: "/content-studio" },
        { label: "Create Exam", href: "/exams" },
        { label: "Open Planner", href: "/classes" }
      ],
      ...common
    };
  }

  if (workspace === "STUDENT") {
    const [home, exams] = await Promise.all([
      getStudentHome(input.userId, input.institutionId),
      getAvailableStudentExams(input.userId)
    ]);
    return {
      key: workspace,
      title: "Student Workspace",
      subtitle: "What should I learn today?",
      kpis: [
        { label: "Continue Learning", value: home.classrooms.length.toString(), href: "/learning" },
        { label: "Today's Classes", value: home.todaysClasses.length.toString(), href: "/learning" },
        { label: "Pending Assignments", value: home.pendingAssignments.length.toString(), href: "/learning" },
        { label: "Upcoming Exams", value: exams.length.toString(), href: "/exams" },
        { label: "Recorded Lessons", value: home.recordedClasses.length.toString(), href: "/learning" },
        { label: "Bookmarks", value: home.classrooms.reduce((total, classroom) => total + classroom.bookmarks.length, 0).toString(), href: "/learning" }
      ],
      primary: [
        { title: "Continue Learning", items: home.classrooms.map((classroom) => `${classroom.course.name} - ${classroom.batch.name}`), href: "/learning" },
        { title: "Today's Assignment", items: home.pendingAssignments.map((assignment) => assignment.title), href: "/learning" },
        { title: "Announcements", items: home.announcements.map((announcement) => announcement.title), href: "/learning" }
      ],
      quickActions: [
        { label: "Open Learning", href: "/learning" },
        { label: "View Exams", href: "/exams" },
        { label: "View Content", href: "/content-studio" }
      ],
      ...common
    };
  }

  if (workspace === "BUSINESS_DEVELOPMENT") {
    const [leads, partners] = await Promise.all([getLeadDashboard(input.institutionId), prisma.partnerReferral.findMany({ where: { partner: { institutionId: input.institutionId ?? undefined } }, include: { partner: true, lead: true }, take: 8 })]);
    return {
      key: workspace,
      title: "Business Development Workspace",
      subtitle: "Leads, follow-ups, applications, partners and admissions in one flow.",
      kpis: [
        { label: "Today's Leads", value: leads.todaysLeads.length.toString(), href: "/admissions" },
        { label: "Today's Follow Ups", value: leads.todaysFollowUps.length.toString(), href: "/admissions" },
        { label: "Applications", value: leads.newApplications.length.toString(), href: "/admissions" },
        { label: "Pending Admissions", value: leads.pendingAdmissions.length.toString(), href: "/admissions" },
        { label: "Partner Referrals", value: partners.length.toString(), href: "/partners" },
        { label: "Conversion", value: `${leads.conversionRate}%`, href: "/admissions" }
      ],
      primary: [
        { title: "Pipeline", items: leads.leads.slice(0, 8).map((lead) => `${lead.name} - ${lead.stage.replaceAll("_", " ")}`), href: "/admissions" },
        { title: "Partner Referrals", items: partners.map((referral) => `${referral.partner.name} - ${referral.lead?.name ?? "New referral"}`), href: "/partners" }
      ],
      quickActions: [
        { label: "Open Admissions", href: "/admissions" },
        { label: "Open Partners", href: "/partners" }
      ],
      ...common
    };
  }

  if (workspace === "ACCOUNTS") {
    const [fees, payments, invoices, receipts, expenses] = await Promise.all([
      getFeeOverview(input.institutionId),
      getPaymentOverview(input.institutionId),
      getInvoicesForInstitution(input.institutionId),
      getReceiptsForInstitution(input.institutionId),
      getExpenseOverview(input.institutionId)
    ]);
    return {
      key: workspace,
      title: "Accounts Workspace",
      subtitle: "Collections, pending fees, receipts, invoices and expenses.",
      kpis: [
        { label: "Today's Collections", value: `INR ${fees.totals.collected.toLocaleString("en-IN")}`, href: "/finance" },
        { label: "Pending Fees", value: fees.studentFees.filter((fee) => fee.status !== "PAID").length.toString(), href: "/finance" },
        { label: "Receipts", value: receipts.length.toString(), href: "/finance" },
        { label: "Invoices", value: invoices.length.toString(), href: "/finance" },
        { label: "Expenses", value: expenses.expenses.length.toString(), href: "/finance" },
        { label: "Payments", value: payments.payments.length.toString(), href: "/finance" }
      ],
      primary: [
        { title: "Outstanding Fees", items: fees.studentFees.slice(0, 8).map((fee) => `${fee.student.name} - INR ${Number(fee.amount).toLocaleString("en-IN")}`), href: "/finance" },
        { title: "Recent Receipts", items: receipts.slice(0, 6).map((receipt) => receipt.receiptNumber), href: "/finance" }
      ],
      quickActions: [{ label: "Quick Collection", href: "/finance" }, { label: "View Reports", href: "/reports" }],
      ...common
    };
  }

  if (workspace === "RECEPTION") {
    const reception = await getReceptionOverview(input.institutionId);
    return {
      key: workspace,
      title: "Reception Workspace",
      subtitle: "Visitors, appointments, walk-ins, documents and admission enquiries.",
      kpis: [
        { label: "Today's Visitors", value: reception.visitors.length.toString(), href: "/reception" },
        { label: "Appointments", value: reception.appointments.length.toString(), href: "/reception" },
        { label: "Walk-ins", value: reception.visitors.filter((visitor) => visitor.status === "WAITING").length.toString(), href: "/reception" },
        { label: "Admission Enquiries", value: reception.visitors.filter((visitor) => visitor.purpose?.toLowerCase().includes("admission")).length.toString(), href: "/reception" }
      ],
      primary: [
        { title: "Visitors", items: reception.visitors.map((visitor) => `${visitor.name} - ${visitor.purpose ?? "Visit"}`), href: "/reception" },
        { title: "Appointments", items: reception.appointments.map((appointment) => `${appointment.visitorName} - ${appointment.purpose ?? "Appointment"}`), href: "/reception" }
      ],
      quickActions: [{ label: "Quick Registration", href: "/reception" }, { label: "Open Admissions", href: "/admissions" }],
      ...common
    };
  }

  if (workspace === "VIDEO_EDITOR") {
    const [queues, storage, analytics] = await Promise.all([getApprovalQueues(input.institutionId), getStorageDashboard(input.institutionId), getContentAnalytics(input.institutionId)]);
    return {
      key: workspace,
      title: "Video Editor Workspace",
      subtitle: "Review, return, approve and publish content without leaving one queue.",
      kpis: [
        { label: "Pending Review", value: queues.videoEditorQueue.length.toString(), href: "/content-studio" },
        { label: "Waiting Approval", value: queues.academicHeadQueue.length.toString(), href: "/content-studio" },
        { label: "Published Today", value: queues.recentlyPublished.length.toString(), href: "/content-studio" },
        { label: "Returned Content", value: queues.videoEditorQueue.filter((item) => item.status === "NEEDS_CHANGES").length.toString(), href: "/content-studio" },
        { label: "Storage Used", value: `${Math.round(storage.usedBytes / 1024 / 1024)} MB`, href: "/content-studio" },
        { label: "Views", value: analytics.totals.views.toString(), href: "/content-studio" }
      ],
      primary: [
        { title: "Pending Review", items: queues.videoEditorQueue.map((item) => `${item.title} - ${item.createdBy?.name ?? "Teacher"}`), href: "/content-studio" },
        { title: "Recently Published", items: queues.recentlyPublished.map((item) => item.title), href: "/content-studio" }
      ],
      quickActions: [{ label: "Open Content Studio", href: "/content-studio" }, { label: "Quick Publish", href: "/content-studio" }],
      ...common
    };
  }

  const parentPortal = await getParentPortal(input.userId, input.institutionId);
  return {
    key: "PARENT",
    title: "Parent Workspace",
    subtitle: "Child summary, attendance, assignments, fees, exams, announcements and communication.",
    kpis: [
      { label: "Children", value: parentPortal.children.length.toString(), href: "/parent" },
      { label: "Today's Classes", value: (parentPortal.learning?.todaysClasses.length ?? 0).toString(), href: "/parent" },
      { label: "Assignments", value: (parentPortal.learning?.pendingAssignments.length ?? 0).toString(), href: "/parent" },
      { label: "Fees", value: parentPortal.fees.filter((fee) => fee.status !== "PAID").length.toString(), href: "/parent" },
      { label: "Exam Results", value: parentPortal.results.length.toString(), href: "/parent" },
      { label: "Announcements", value: (parentPortal.learning?.announcements.length ?? 0).toString(), href: "/parent" }
    ],
    primary: [
      { title: "Child Overview", items: parentPortal.selectedChild ? [parentPortal.selectedChild.name, parentPortal.selectedChild.email] : [], href: "/parent" },
      { title: "Homework", items: parentPortal.learning?.pendingAssignments.map((assignment) => assignment.title) ?? [], href: "/parent" },
      { title: "Communication", items: parentPortal.communications.map((item) => item.communication.title), href: "/parent" }
    ],
    quickActions: [{ label: "Open Parent Portal", href: "/parent" }],
    ...common
  };
}
