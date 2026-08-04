import { getStudentAIHome } from "@/services/student-ai-learning-service";
import { getStudentFoundation } from "@/services/student-foundation-service";

const defaultWidgets = ["mission", "classes", "assignments", "progress", "announcements"];

function dailyMissionPreferenceKey() {
  return `learnx.daily-mission.${new Date().toISOString().slice(0, 10)}`;
}

export async function getStudentDashboard(input: { userId?: string; institutionId?: string | null }) {
  const [learning, foundation] = await Promise.all([getStudentAIHome(input), getStudentFoundation(input.userId)]);
  const dashboardPreference = learning.preferences.preferences.find((item) => item.key === "learnx.dashboard");
  const missionPreference = learning.preferences.preferences.find((item) => item.key === dailyMissionPreferenceKey());
  const widgets = Array.isArray(dashboardPreference?.value) ? dashboardPreference.value.filter((item): item is string => typeof item === "string") : defaultWidgets;
  const completedMissionItems = Array.isArray(missionPreference?.value) ? missionPreference.value.filter((item): item is string => typeof item === "string") : [];
  const focus = learning.home.pendingAssignments[0]?.title ?? learning.home.todaysClasses[0]?.entry.subject?.name ?? foundation?.studentProfile?.interests[0] ?? "Revise one important topic";
  return {
    ...learning, foundation, widgets, completedMissionItems, focus,
    mission: [
      { id: "focus", title: `Build confidence in ${focus}`, href: "/student/learn" },
      { id: "practice", title: "Complete one focused practice set", href: "/student/practice" },
      { id: "review", title: "Review notes or flashcards for 10 minutes", href: "/student/flashcards" }
    ]
  };
}
