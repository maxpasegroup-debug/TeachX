import { Camera, GraduationCap, Languages, MapPin, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { getStudentProfileCompletion, getTeacherProfileCompletion } from "@/services/teachx-operating-service";

function Field({ label, value, placeholder }: { label: string; value?: string | null; placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input readOnly value={value ?? ""} placeholder={placeholder} />
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true, teacherProfile: true, studentProfile: true, roles: { include: { role: true } } }
      })
    : null;
  const isStudent = user?.roles.some(({ role }) => role.key === "STUDENT") ?? false;
  const completion = isStudent
    ? getStudentProfileCompletion({
        avatarUrl: user?.profile?.avatarUrl,
        name: user?.name,
        title: user?.profile?.title,
        phone: user?.profile?.phone,
        headline: user?.studentProfile?.interests?.[0],
        learningGoal: user?.studentProfile?.learningGoal,
        interests: user?.studentProfile?.interests
      })
    : getTeacherProfileCompletion({
        avatarUrl: user?.profile?.avatarUrl,
        name: user?.name,
        title: user?.profile?.title,
        phone: user?.profile?.phone,
        bio: user?.teacherProfile?.bio ?? user?.profile?.bio,
        headline: user?.teacherProfile?.headline,
        subjects: user?.teacherProfile?.subjects,
        interests: []
      });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>{isStudent ? "Student Profile" : "Teacher Profile"}</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Profile</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Complete your profile so TeachX can personalize your daily workspace and prepare for Phase 3 AI Studio.</p>
          </div>
          <Card className="p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-xl font-semibold text-sky-800">{getInitials(user?.name)}</div>
              <div>
                <p className="font-semibold">{user?.name ?? "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Progress className="mt-5" value={completion.percentage} />
            <p className="mt-2 text-sm text-muted-foreground">{completion.percentage}% complete</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="p-5 shadow-soft">
          <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-muted text-3xl font-semibold">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Completion Engine</h2>
          <Progress className="mt-4" value={completion.percentage} />
          <div className="mt-5 space-y-2">
            {completion.missingFields.map((field) => (
              <p className="rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground" key={field}>
                Missing: {field}
              </p>
            ))}
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h2 className="text-xl font-semibold">{isStudent ? "Student Details" : "Teacher Details"}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {isStudent ? (
              <>
                <Field label="Photo" value={user?.profile?.avatarUrl} placeholder="Profile photo URL" />
                <Field label="Name" value={user?.name} placeholder="Full name" />
                <Field label="Class" value={user?.profile?.title} placeholder="Class or grade" />
                <Field label="Board" value={user?.studentProfile?.interests?.[0]} placeholder="CBSE, ICSE, State Board" />
                <Field label="School" value={user?.profile?.phone} placeholder="School name" />
                <Field label="Language" value={user?.studentProfile?.interests?.[1]} placeholder="Preferred language" />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Learning Goals</label>
                  <Textarea readOnly value={user?.studentProfile?.learningGoal ?? ""} placeholder="Learning goals" />
                </div>
              </>
            ) : (
              <>
                <Field label="Professional Photo" value={user?.profile?.avatarUrl} placeholder="Profile photo URL" />
                <Field label="Name" value={user?.name} placeholder="Full name" />
                <Field label="Qualification" value={user?.profile?.title} placeholder="Qualification" />
                <Field label="Experience" value={user?.teacherProfile?.headline} placeholder="Teaching experience" />
                <Field label="Subjects" value={user?.teacherProfile?.subjects.join(", ")} placeholder="Subjects" />
                <Field label="Classes" value={user?.teacherProfile?.subjects.slice(0, 2).join(", ")} placeholder="Classes taught" />
                <Field label="Languages" value="" placeholder="Languages" />
                <Field label="Location" value={user?.profile?.phone} placeholder="Location" />
                <Field label="Teaching Mode" value="" placeholder="Online, Offline, Hybrid" />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea readOnly value={user?.teacherProfile?.bio ?? user?.profile?.bio ?? ""} placeholder="Professional bio" />
                </div>
              </>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 shadow-soft"><UserRound className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Identity</p><p className="mt-1 text-sm text-muted-foreground">Name and photo</p></Card>
        <Card className="p-5 shadow-soft"><GraduationCap className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Learning</p><p className="mt-1 text-sm text-muted-foreground">Subjects and goals</p></Card>
        <Card className="p-5 shadow-soft"><Languages className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Language</p><p className="mt-1 text-sm text-muted-foreground">Preferences</p></Card>
        <Card className="p-5 shadow-soft"><MapPin className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Location</p><p className="mt-1 text-sm text-muted-foreground">Mode and region</p></Card>
      </section>
    </div>
  );
}
