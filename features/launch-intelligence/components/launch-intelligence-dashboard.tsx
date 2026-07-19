import { Activity, BarChart3, Bot, CheckCircle2, Clock, GraduationCap, Repeat2, UserPlus, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LocalLaunchSignals } from "@/features/launch-intelligence/components/local-launch-signals";
import type { getAdminGrowthOS } from "@/services/admin-growth-service";

type GrowthData = Awaited<ReturnType<typeof getAdminGrowthOS>>;

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function teacherStrength(profile: GrowthData["marketplace"]["teachers"][number]) {
  const checks = [
    profile.user.name,
    profile.headline,
    profile.bio,
    profile.subjects.length,
    profile.qualification,
    profile.experienceYears,
    profile.languages.length,
    profile.teachingMode,
    profile.availability
  ];
  return percent(checks.filter(Boolean).length, checks.length);
}

function studentStrength(profile: GrowthData["users"]["students"][number]) {
  const checks = [profile.user.name, profile.learningGoal, profile.interests.length];
  return percent(checks.filter(Boolean).length, checks.length);
}

function FunnelCard({ title, value, total }: { title: string; value: number; total: number }) {
  const conversion = percent(value, total);

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <Badge>{conversion}%</Badge>
      </div>
      <Progress className="mt-4" value={conversion} />
    </Card>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card className="p-5 shadow-soft">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </Card>
  );
}

export function LaunchIntelligenceDashboard({ data }: { data: GrowthData }) {
  const teacherUsers = data.users.teachers.length;
  const studentUsers = data.users.students.length;
  const completedTeacherProfiles = data.users.teachers.filter((profile) => teacherStrength(profile) >= 70).length;
  const completedStudentProfiles = data.users.students.filter((profile) => studentStrength(profile) >= 70).length;
  const teacherAI = data.ai.teacherUsage;
  const studentAI = data.ai.studentUsage;
  const publishedResources = data.marketplace.resources.filter((item) => item.status === "PUBLISHED").length;
  const returnedTeachers = data.users.teachers.filter((profile) => profile.updatedAt > profile.createdAt).length;
  const returnedStudents = data.users.students.filter((profile) => profile.updatedAt > profile.createdAt).length;
  const learningActivity = data.marketplace.downloads.length + data.community.bookings.length;
  const avgTeacherCompletion = average(data.users.teachers.map(teacherStrength));
  const avgStudentCompletion = average(data.users.students.map(studentStrength));
  const avgProfileCompletion = average([avgTeacherCompletion, avgStudentCompletion].filter(Boolean));
  const activationRate = percent(completedTeacherProfiles + completedStudentProfiles, teacherUsers + studentUsers);
  const todayTeachers = data.users.growthTrends[0]?.value ? data.users.teachers.filter((profile) => profile.createdAt >= new Date(new Date().setHours(0, 0, 0, 0))).length : 0;
  const todayStudents = data.users.growthTrends[0]?.value ? data.users.students.filter((profile) => profile.createdAt >= new Date(new Date().setHours(0, 0, 0, 0))).length : 0;
  const feedbackTickets = data.support.tickets.filter((ticket) => ticket.type === "FEEDBACK").length;
  const bugTickets = data.support.bugs;

  return (
    <section className="space-y-6">
      <Card className="p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge>Launch Intelligence</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Beta readiness overview</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">A lightweight product-operations layer for activation funnels, product health, feedback, and bug reporting. Some metrics are marked as pending until deeper event instrumentation is connected.</p>
          </div>
          <Badge>V1.0 beta</Badge>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-sky-700" />
            <h3 className="text-xl font-semibold">Teacher Funnel</h3>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FunnelCard title="Invited" value={teacherUsers} total={teacherUsers} />
            <FunnelCard title="Registered" value={teacherUsers} total={teacherUsers} />
            <FunnelCard title="Completed Profile" value={completedTeacherProfiles} total={teacherUsers} />
            <FunnelCard title="Generated First AI Lesson" value={teacherAI} total={teacherUsers} />
            <FunnelCard title="Published First Resource" value={publishedResources} total={teacherUsers} />
            <FunnelCard title="Returned" value={returnedTeachers} total={teacherUsers} />
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <UsersRound className="h-5 w-5 text-sky-700" />
            <h3 className="text-xl font-semibold">Student Funnel</h3>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FunnelCard title="Invited" value={studentUsers} total={studentUsers} />
            <FunnelCard title="Registered" value={studentUsers} total={studentUsers} />
            <FunnelCard title="Completed Profile" value={completedStudentProfiles} total={studentUsers} />
            <FunnelCard title="Used AI Tutor" value={studentAI} total={studentUsers} />
            <FunnelCard title="Completed First Learning Activity" value={learningActivity} total={studentUsers} />
            <FunnelCard title="Returned" value={returnedStudents} total={studentUsers} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="New Teachers" value={String(teacherUsers)} note="Registered teacher profiles" />
        <MetricCard label="New Students" value={String(studentUsers)} note="Registered student profiles" />
        <MetricCard label="Activation Rate" value={`${activationRate}%`} note="Profile-ready users" />
        <MetricCard label="Avg Profile Completion" value={`${avgProfileCompletion}%`} note="Teacher + student average" />
        <MetricCard label="Avg Session Duration" value="Pending" note="Needs session instrumentation" />
        <MetricCard label="Returning Users" value={String(returnedTeachers + returnedStudents)} note="Updated after registration" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-sky-700" />
            <h3 className="text-xl font-semibold">Admin Launch Overview</h3>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Teachers Joined Today" value={String(todayTeachers)} />
            <MetricCard label="Students Joined Today" value={String(todayStudents)} />
            <MetricCard label="Feedback Submitted" value={String(feedbackTickets)} note="Support backend feedback" />
            <MetricCard label="Bug Reports" value={String(bugTickets)} note="Support backend bugs" />
            <MetricCard label="Profile Completion" value={`${avgProfileCompletion}%`} />
            <MetricCard label="Activation" value={`${activationRate}%`} />
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-sky-700" />
            <h3 className="text-xl font-semibold">Product Health Signals</h3>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <p className="rounded-xl border border-border bg-background px-4 py-3"><UserPlus className="mr-2 inline h-4 w-4 text-sky-700" />Registrations are sourced from existing user/profile data.</p>
            <p className="rounded-xl border border-border bg-background px-4 py-3"><Bot className="mr-2 inline h-4 w-4 text-sky-700" />AI activation reuses AIUsage counts.</p>
            <p className="rounded-xl border border-border bg-background px-4 py-3"><Repeat2 className="mr-2 inline h-4 w-4 text-sky-700" />Return behavior is approximated from profile updates.</p>
            <p className="rounded-xl border border-border bg-background px-4 py-3"><Clock className="mr-2 inline h-4 w-4 text-sky-700" />Session duration is pending deeper instrumentation.</p>
            <p className="rounded-xl border border-border bg-background px-4 py-3"><CheckCircle2 className="mr-2 inline h-4 w-4 text-sky-700" />Local widget data remains available until centralized persistence is connected.</p>
          </div>
          <div className="mt-5">
            <LocalLaunchSignals />
          </div>
        </Card>
      </div>
    </section>
  );
}
