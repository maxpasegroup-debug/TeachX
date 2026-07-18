import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, CalendarDays, Download, GraduationCap, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDefaultInstitution } from "@/services/institution-service";
import { getCoursesForInstitution } from "@/services/course-service";
import { getPlannerData } from "@/services/planner-service";
import { sentenceCase } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GuestPortalPage() {
  const institution = await getDefaultInstitution();
  const [courses, planner] = await Promise.all([
    getCoursesForInstitution(institution?.id),
    getPlannerData(institution?.id)
  ]);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Guest learning portal</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">{institution?.name ?? "Institution"}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Browse courses, watch free lessons, meet faculty, and apply when you are ready.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>Apply Now</Button>
            <Button variant="secondary">Contact Institution</Button>
          </div>
        </div>
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <GuestCard icon={<BookOpen className="h-5 w-5" />} title="Browse Courses" value={courses.length.toString()} />
          <GuestCard icon={<GraduationCap className="h-5 w-5" />} title="Recorded Courses" value={planner.entries.length.toString()} />
          <GuestCard icon={<CalendarDays className="h-5 w-5" />} title="Events" value="Ready" />
          <GuestCard icon={<Download className="h-5 w-5" />} title="Brochure" value="Download" />
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold">Courses</h2>
            <div className="mt-6 space-y-4">
              {courses.length ? courses.map((course) => (
                <div className="rounded-lg bg-muted p-4" key={course.id}>
                  <p className="font-semibold">{course.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{course.description ?? "Course details coming soon."}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{course.learningModes.map(sentenceCase).join(", ")}</p>
                </div>
              )) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">Courses will appear here soon.</p>}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold">Guest Dashboard</h2>
            <div className="mt-6 space-y-3 text-sm">
              <p className="rounded-lg bg-muted px-4 py-4">Continue Learning</p>
              <p className="rounded-lg bg-muted px-4 py-4">Purchased Courses</p>
              <p className="rounded-lg bg-muted px-4 py-4">Applications</p>
              <p className="rounded-lg bg-muted px-4 py-4">Certificates Placeholder</p>
              <p className="rounded-lg bg-muted px-4 py-4">Notifications</p>
            </div>
            <Link className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" href="/login">
              <Phone className="h-4 w-4" />
              Create account or sign in
            </Link>
          </Card>
        </section>
      </section>
    </main>
  );
}

function GuestCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return <Card className="p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{icon}</div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>;
}
