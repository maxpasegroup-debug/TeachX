import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudentClassroom } from "@/services/learning-service";
import { formatDate, sentenceCase } from "@/lib/format";

type StudentHomeProps = {
  name?: string | null;
  home: {
    classrooms: StudentClassroom[];
    continueLearning?: StudentClassroom;
    todaysClasses: { classroom: StudentClassroom; entry: StudentClassroom["batch"]["timetableEntries"][number] }[];
    upcomingLiveClasses: StudentClassroom["liveSessions"];
    recordedClasses: StudentClassroom["recordings"];
    pendingAssignments: StudentClassroom["assignments"];
    announcements: StudentClassroom["announcements"];
    upcomingTests: unknown[];
    certificates: unknown[];
    progress: StudentClassroom["learningProgress"];
  };
};

export function StudentHome({ name, home }: StudentHomeProps) {
  const progressAverage = home.progress.length ? Math.round(home.progress.reduce((total, item) => total + item.completion, 0) / home.progress.length) : 0;

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <p className="text-sm font-medium text-muted-foreground">Student home</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Good Morning, {name?.split(" ")[0] ?? "Student"}</h1>
        <p className="mt-3 text-lg text-muted-foreground">What should you learn today?</p>
        {home.continueLearning ? (
          <Link href={`/learning/${home.continueLearning.id}`}>
            <Button className="mt-8">Continue Learning</Button>
          </Link>
        ) : null}
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Mini label="Today Classes" value={home.todaysClasses.length.toString()} />
        <Mini label="Pending Assignments" value={home.pendingAssignments.length.toString()} />
        <Mini label="Upcoming Live" value={home.upcomingLiveClasses.length.toString()} />
        <Mini label="Progress" value={`${progressAverage}%`} />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Today Classes</h2>
          <div className="mt-5 space-y-3">
            {home.todaysClasses.length ? home.todaysClasses.map(({ classroom, entry }) => (
              <p className="rounded-lg bg-muted px-4 py-4 text-sm" key={`${classroom.id}-${entry.id}`}>{classroom.course.name} - {entry.timeSlot.name} - {entry.subject?.name ?? "Lesson"}</p>
            )) : <Empty text="No classes today." />}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Announcements</h2>
          <div className="mt-5 space-y-3">
            {home.announcements.length ? home.announcements.map((item) => <p className="rounded-lg bg-muted px-4 py-4 text-sm" key={item.id}>{item.title}</p>) : <Empty text="No announcements." />}
          </div>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title="Recorded Classes" items={home.recordedClasses.map((item) => `${item.title} - ${sentenceCase(item.status)}`)} empty="No recordings yet." />
        <Panel title="Pending Assignments" items={home.pendingAssignments.map((item) => `${item.title} - Due ${formatDate(item.dueDate)}`)} empty="No pending assignments." />
        <Panel title="Certificates" items={[]} empty="Certificates will appear here later." />
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-4 text-3xl font-semibold">{value}</p></Card>;
}

function Panel({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <Card className="p-6"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{items.length ? items.map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={item}>{item}</p>) : <Empty text={empty} />}</div></Card>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">{text}</p>;
}
