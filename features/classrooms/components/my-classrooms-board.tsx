import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ClassroomWithDetails } from "@/services/classroom-service";
import { formatDate, sentenceCase } from "@/lib/format";

export function MyClassroomsBoard({ classrooms }: { classrooms: ClassroomWithDetails[] }) {
  if (!classrooms.length) {
    return <Card className="p-10 text-center text-muted-foreground">No classrooms are assigned yet.</Card>;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {classrooms.map((classroom) => {
        const nextClass = classroom.batch.timetableEntries[0];
        const todayStatus = classroom.attendanceSessions[0]?.savedAt ? "Attendance saved" : "Ready for today";

        return (
          <Card className="p-7" key={classroom.id}>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{classroom.course.name}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{classroom.batch.name}</h2>
              </div>
              <span className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">{sentenceCase(classroom.batch.mode)}</span>
            </div>
            <div className="mt-8 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
              <p><span className="block font-medium text-foreground">Today's status</span>{todayStatus}</p>
              <p><span className="block font-medium text-foreground">Students</span>{classroom.batch.students.length}</p>
              <p><span className="block font-medium text-foreground">Next class</span>{nextClass ? `${sentenceCase(nextClass.day)} · ${nextClass.timeSlot.name}` : "Not planned"}</p>
              <p><span className="block font-medium text-foreground">Updated</span>{formatDate(classroom.updatedAt)}</p>
            </div>
            <Link href={`/classrooms/${classroom.id}`}>
              <Button className="mt-8 w-full md:w-auto">Open Classroom</Button>
            </Link>
          </Card>
        );
      })}
    </section>
  );
}
