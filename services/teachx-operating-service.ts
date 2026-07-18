import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";
import { getUserPreferences } from "@/services/preference-service";
import { getRecentNotifications } from "@/services/notification-service";

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
    { label: "Location", done: Boolean(input.phone), suggestion: "Add contact/location details for trusted onboarding." },
    { label: "Teaching mode", done: Boolean(input.interests?.length), suggestion: "Choose Online, Offline, or Hybrid as your teaching mode." }
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
  const user = await getTeachXUser(input.userId);
  const [preferences, notifications, resourcesCreated, studentsHelped, downloads] = await Promise.all([
    getUserPreferences(input.userId),
    getRecentNotifications(input.userId, 12),
    input.userId ? prisma.contentItem.count({ where: { createdById: input.userId } }) : 0,
    input.userId ? prisma.batchStudent.count({ where: { batch: { faculty: { some: { facultyId: input.userId } } } } }) : 0,
    input.userId ? prisma.downloadHistory.count({ where: { item: { createdById: input.userId } } }) : 0
  ]);

  const completion = getTeacherProfileCompletion({
    avatarUrl: user?.profile?.avatarUrl,
    name: user?.name,
    title: user?.profile?.title,
    phone: user?.profile?.phone,
    bio: user?.teacherProfile?.bio ?? user?.profile?.bio,
    headline: user?.teacherProfile?.headline,
    subjects: user?.teacherProfile?.subjects,
    interests: []
  });

  return {
    user,
    notifications,
    preferences,
    completion,
    plan: "TeachX Starter",
    aiCreditsRemaining: 240,
    stats: {
      resourcesCreated,
      studentsHelped,
      aiCredits: 240,
      downloads
    }
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
