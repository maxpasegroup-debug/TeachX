import Link from "next/link";
import { Award, CheckCircle2, Circle, Eye, GraduationCap, Languages, MapPin, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { getStudentProfileCompletion, getTeacherProfileCompletion } from "@/services/teachx-operating-service";

type StrengthItem = {
  label: string;
  done: boolean;
};

function Field({ label, value, placeholder }: { label: string; value?: string | null; placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input readOnly value={value ?? ""} placeholder={placeholder} />
    </div>
  );
}

function strengthPercentage(items: StrengthItem[]) {
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

function ProfileStrengthPanel({ title, items }: { title: string; items: StrengthItem[] }) {
  const percentage = strengthPercentage(items);

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Profile Strength</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">{percentage}%</h2>
        </div>
        <Badge>{title}</Badge>
      </div>
      <Progress className="mt-5" value={percentage} />
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm" key={item.label}>
            {item.done ? <CheckCircle2 className="h-4 w-4 text-sky-700" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            <span className={item.done ? "font-medium text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProfessionalBadge({ label, icon: Icon, active = false }: { label: string; icon: typeof Star; active?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-sky-200 bg-sky-50 text-sky-950" : "border-border bg-background text-muted-foreground"}`}>
      <Icon className={`h-5 w-5 ${active ? "text-sky-700" : "text-muted-foreground"}`} />
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs">{active ? "Visible badge" : "Visual milestone"}</p>
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
  const teacherStrength: StrengthItem[] = [
    { label: "Profile Photo", done: Boolean(user?.profile?.avatarUrl) },
    { label: "Name", done: Boolean(user?.name) },
    { label: "Cover Photo", done: Boolean(user?.teacherProfile?.coverUrl) },
    { label: "Professional Bio", done: Boolean(user?.teacherProfile?.bio ?? user?.profile?.bio) },
    { label: "Subjects", done: Boolean(user?.teacherProfile?.subjects.length) },
    { label: "Qualifications", done: Boolean(user?.teacherProfile?.qualification ?? user?.profile?.title) },
    { label: "Experience", done: Boolean(user?.teacherProfile?.experienceYears ?? user?.teacherProfile?.headline) },
    { label: "Languages", done: Boolean(user?.teacherProfile?.languages.length) },
    { label: "Teaching Availability", done: Boolean(user?.teacherProfile?.availability) },
    { label: "Teaching Preferences", done: Boolean(user?.teacherProfile?.teachingMode ?? user?.teacherProfile?.teachingStyle) },
    { label: "Profile Verification", done: false }
  ];
  const studentStrength: StrengthItem[] = [
    { label: "Photo", done: Boolean(user?.profile?.avatarUrl) },
    { label: "Bio", done: Boolean(user?.profile?.bio) },
    { label: "Learning Interests", done: Boolean(user?.studentProfile?.interests.length) },
    { label: "Favourite Subjects", done: Boolean((user?.studentProfile?.interests.length ?? 0) > 1) },
    { label: "Learning Goals", done: Boolean(user?.studentProfile?.learningGoal) },
    { label: "Preferred Language", done: Boolean((user?.studentProfile?.interests.length ?? 0) > 1) },
    { label: "Grade", done: Boolean(user?.profile?.title) },
    { label: "Learning Preferences", done: Boolean(user?.studentProfile?.interests.length) }
  ];
  const activeStrength = isStudent ? studentStrength : teacherStrength;
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
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Turn your TeachX Guru profile into a trusted professional identity that helps people discover, understand, and connect with you.</p>
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
        <ProfileStrengthPanel items={activeStrength} title={isStudent ? "Student Trust" : "Teacher Trust"} />

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
                <Field label="Qualification" value={user?.teacherProfile?.qualification ?? user?.profile?.title} placeholder="Qualification" />
                <Field label="Experience" value={user?.teacherProfile?.experienceYears ? `${user.teacherProfile.experienceYears} years` : user?.teacherProfile?.headline} placeholder="Teaching experience" />
                <Field label="Subjects" value={user?.teacherProfile?.subjects.join(", ")} placeholder="Subjects" />
                <Field label="Classes" value={user?.teacherProfile?.classes.join(", ")} placeholder="Classes taught" />
                <Field label="Languages" value={user?.teacherProfile?.languages.join(", ")} placeholder="Languages" />
                <Field label="Location" value={user?.teacherProfile?.location ?? user?.profile?.phone} placeholder="Location" />
                <Field label="Teaching Mode" value={user?.teacherProfile?.teachingMode} placeholder="Online, Offline, Hybrid" />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea readOnly value={user?.teacherProfile?.bio ?? user?.profile?.bio ?? ""} placeholder="Professional bio" />
                </div>
              </>
            )}
          </div>
        </Card>
      </section>

      {!isStudent ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Professional Badges</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Visual trust signals for profile discovery. Verification and ranking logic can connect later without changing the profile layout.</p>
              </div>
              <Badge>Visual only</Badge>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProfessionalBadge active label="New Teacher" icon={Sparkles} />
              <ProfessionalBadge active={completion.percentage >= 90} label="Verified Teacher" icon={ShieldCheck} />
              <ProfessionalBadge active={Boolean((user?.teacherProfile?.achievements.length ?? 0) > 2)} label="Top Educator" icon={Award} />
              <ProfessionalBadge active={Boolean((user?.teacherProfile?.experienceYears ?? 0) >= 10)} label="Master Mentor" icon={Star} />
            </div>
          </Card>

          <Card className="overflow-hidden shadow-soft">
            <div className="h-24 bg-gradient-to-br from-sky-100 via-white to-blue-100" />
            <div className="p-5">
              <div className="-mt-12 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-sky-100 text-xl font-semibold text-sky-800 shadow-sm">{getInitials(user?.name)}</div>
              <h2 className="mt-4 text-xl font-semibold">Profile Preview</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Preview how students will see your public teaching identity.</p>
              <Link className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary" href={user?.teacherProfile?.id ? `/marketplace/teachers/${user.teacherProfile.id}` : "/teacher/marketplace"}>
                <Eye className="h-4 w-4" />
                Preview Public Profile
              </Link>
            </div>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 shadow-soft"><UserRound className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Identity</p><p className="mt-1 text-sm text-muted-foreground">Name and photo</p></Card>
        <Card className="p-5 shadow-soft"><GraduationCap className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Learning</p><p className="mt-1 text-sm text-muted-foreground">Subjects and goals</p></Card>
        <Card className="p-5 shadow-soft"><Languages className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Language</p><p className="mt-1 text-sm text-muted-foreground">Preferences</p></Card>
        <Card className="p-5 shadow-soft"><MapPin className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Location</p><p className="mt-1 text-sm text-muted-foreground">Mode and region</p></Card>
      </section>
    </div>
  );
}
