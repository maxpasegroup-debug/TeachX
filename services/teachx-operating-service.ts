import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";
import { getUserPreferences } from "@/services/preference-service";
import { getRecentNotifications } from "@/services/notification-service";
import { getTeacherDashboard } from "@/services/classroom-service";
import { getRecentActivities } from "@/services/activity-service";
import { getAICreditSummary } from "@/services/commerce-service";

// Shared Platform: profile completion and workspace summary helpers are reused
// by TeachX Guru today and by future frontends without changing backend models.
type CompletionInput = {
  avatarUrl?: string | null;
  name?: string | null;
  title?: string | null;
  phone?: string | null;
  bio?: string | null;
  headline?: string | null;
  subjects?: string[];
  learningGoal?: string | null;
  interests?: string[];
  location?: string | null;
  teachingMode?: string | null;
};

export type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  suggestions: string[];
};

function calculateCompletion(required: { label: string; done: boolean; suggestion: string }[]): ProfileCompletion {
  const completed = required.filter((item) => item.done).length;
  const percentage = Math.round((completed / required.length) * 100);
  const missing = required.filter((item) => !item.done);

  return {
    percentage,
    missingFields: missing.map((item) => item.label),
    suggestions: missing.slice(0, 3).map((item) => item.suggestion)
  };
}

export function getTeacherProfileCompletion(input: CompletionInput) {
  return calculateCompletion([
    { label: "Professional photo", done: Boolean(input.avatarUrl), suggestion: "Add a professional photo so learners recognize you quickly." },
    { label: "Name", done: Boolean(input.name), suggestion: "Add your full teaching name." },
    { label: "Qualification", done: Boolean(input.title), suggestion: "Add your qualification or professional title." },
    { label: "Experience", done: Boolean(input.headline), suggestion: "Write a short experience headline." },
    { label: "Subjects", done: Boolean(input.subjects?.length), suggestion: "Add the subjects you teach." },
    { label: "Bio", done: Boolean(input.bio), suggestion: "Add a short bio that explains your teaching style." },
    { label: "Location", done: Boolean(input.location), suggestion: "Add your teaching location." },
    { label: "Teaching mode", done: Boolean(input.teachingMode), suggestion: "Choose Online, Offline, or Hybrid as your teaching mode." }
  ]);
}

export function getStudentProfileCompletion(input: CompletionInput) {
  return calculateCompletion([
    { label: "Photo", done: Boolean(input.avatarUrl), suggestion: "Add a profile photo for your learning workspace." },
    { label: "Name", done: Boolean(input.name), suggestion: "Add your full name." },
    { label: "Class", done: Boolean(input.title), suggestion: "Add your class or grade." },
    { label: "Board", done: Boolean(input.headline), suggestion: "Add your board or curriculum." },
    { label: "School", done: Boolean(input.phone), suggestion: "Add your school information." },
    { label: "Language", done: Boolean(input.interests?.length), suggestion: "Choose your preferred learning language." },
    { label: "Learning goals", done: Boolean(input.learningGoal), suggestion: "Add your learning goals to personalize recommendations." }
  ]);
}

async function getTeachXUser(userId?: string) {
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      teacherProfile: true,
      studentProfile: true,
      roles: { include: { role: true } }
    }
  });
}

export async function getTeacherOperatingHome(input: { userId?: string; institutionId?: string | null; roles: RoleKey[] }) {
  const hasWorkspace = Boolean(input.userId && input.institutionId);
  const user = hasWorkspace ? await getTeachXUser(input.userId) : null;
  const [preferences, notifications, resourcesCreated, studentsHelped, downloads, teacherDashboard, recentAI, recentResources, savedDrafts, recentActivity, credits] = await Promise.all([
    getUserPreferences(input.userId),
    getRecentNotifications(input.userId, 12),
    hasWorkspace ? prisma.contentItem.count({ where: { createdById: input.userId!, institutionId: input.institutionId! } }) : 0,
    hasWorkspace ? prisma.batchStudent.count({ where: { batch: { course: { institutionId: input.institutionId! }, faculty: { some: { facultyId: input.userId! } } } } }) : 0,
    hasWorkspace ? prisma.downloadHistory.count({ where: { item: { createdById: input.userId!, institutionId: input.institutionId! } } }) : 0,
    getTeacherDashboard(input.userId, input.institutionId, input.roles),
    hasWorkspace ? prisma.aIConversation.findMany({ where: { userId: input.userId!, institutionId: input.institutionId!, scope: "TEACHER" }, orderBy: { updatedAt: "desc" }, take: 5 }) : [],
    hasWorkspace ? prisma.contentItem.findMany({ where: { createdById: input.userId!, institutionId: input.institutionId! }, orderBy: { updatedAt: "desc" }, take: 5 }) : [],
    hasWorkspace ? prisma.contentItem.findMany({ where: { createdById: input.userId!, institutionId: input.institutionId!, status: "DRAFT" }, orderBy: { updatedAt: "desc" }, take: 5 }) : [],
    getRecentActivities(input.institutionId, 8),
    getAICreditSummary({ userId: input.userId, institutionId: input.institutionId, audience: "TEACHER" })
  ]);

  const completion = getTeacherProfileCompletion({
    avatarUrl: user?.profile?.avatarUrl,
    name: user?.name,
    title: user?.profile?.title,
    phone: user?.profile?.phone,
    bio: user?.teacherProfile?.bio ?? user?.profile?.bio,
    headline: user?.teacherProfile?.headline,
    subjects: user?.teacherProfile?.subjects,
    location: user?.teacherProfile?.location,
    teachingMode: user?.teacherProfile?.teachingMode
  });

  return {
    user,
    notifications,
    preferences,
    completion,
    plan: credits.subscription?.status === "TRIALING"
      ? `7-day trial · ${Math.max(0, Math.ceil(((credits.subscription.periodEnd?.getTime() ?? Date.now()) - Date.now()) / 86_400_000))} days left`
      : credits.subscription?.name ?? (credits.monthlyAllocation > 0 ? "AI plan active" : "AI access not active"),
    aiCreditsRemaining: credits.remaining,
    stats: {
      resourcesCreated,
      studentsHelped,
      aiCredits: credits.remaining,
      downloads
    },
    daily: {
      todaysClasses: teacherDashboard.todaysClasses.map(({ classroom, entry }) => ({
        title: `${entry.subject?.name ?? "Class"} - ${classroom.batch.name}`,
        meta: `${entry.timeSlot.startsAt}-${entry.timeSlot.endsAt}`,
        href: `/classrooms/${classroom.id}`
      })),
      schedule: teacherDashboard.upcomingClasses.map(({ classroom, entry }) => ({
        title: `${entry.day} - ${entry.subject?.name ?? "Class"}`,
        meta: `${entry.timeSlot.startsAt}-${entry.timeSlot.endsAt} - ${classroom.batch.name}`,
        href: `/classrooms/${classroom.id}`
      })),
      pendingTasks: [
        ...teacherDashboard.pendingAttendance.map((classroom) => ({ title: `Take attendance - ${classroom.batch.name}`, meta: "Attendance", href: `/classrooms/${classroom.id}` })),
        ...(teacherDashboard.assignmentsAwaitingReview ? [{ title: `${teacherDashboard.assignmentsAwaitingReview} homework submissions to review`, meta: "Homework", href: "/teacher/workspace/classrooms" }] : [])
      ],
      recentAI: recentAI.map((item) => ({ title: item.title, meta: item.updatedAt.toLocaleString(), href: "/teacher/workspace/saved-ai" })),
      recentResources: recentResources.map((item) => ({ title: item.title, meta: item.type.replaceAll("_", " "), href: "/teacher/workspace/resources" })),
      activity: recentActivity.map((item) => ({ title: item.title, meta: item.body, href: item.link }))
    },
    savedDrafts: savedDrafts.map((item) => ({ title: item.title, meta: item.type.replaceAll("_", " "), href: "/teacher/workspace/resources" }))
  };
}

export async function getStudentOperatingHome(input: { userId?: string; institutionId?: string | null }) {
  const user = await getTeachXUser(input.userId);
  const [preferences, notifications, progressCount, bookmarks, downloads] = await Promise.all([
    getUserPreferences(input.userId),
    getRecentNotifications(input.userId, 12),
    input.userId ? prisma.learningProgress.count({ where: { studentId: input.userId } }) : 0,
    input.userId ? prisma.bookmark.count({ where: { studentId: input.userId } }) : 0,
    input.userId ? prisma.downloadHistory.count({ where: { userId: input.userId } }) : 0
  ]);

  const completion = getStudentProfileCompletion({
    avatarUrl: user?.profile?.avatarUrl,
    name: user?.name,
    title: user?.profile?.title,
    phone: user?.profile?.phone,
    headline: user?.studentProfile?.interests?.[0],
    learningGoal: user?.studentProfile?.learningGoal,
    interests: user?.studentProfile?.interests
  });

  return {
    user,
    notifications,
    preferences,
    completion,
    stats: {
      progressCount,
      bookmarks,
      downloads,
      savedNotes: input.userId ? await prisma.studentNote.count({ where: { studentId: input.userId } }) : 0
    }
  };
}
