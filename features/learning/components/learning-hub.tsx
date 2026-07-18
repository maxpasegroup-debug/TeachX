import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudentClassroom } from "@/services/learning-service";
import { sentenceCase } from "@/lib/format";

export function LearningHub({ classrooms }: { classrooms: StudentClassroom[] }) {
  if (!classrooms.length) return <Card className="p-10 text-center text-muted-foreground">No enrolled courses yet.</Card>;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {classrooms.map((classroom) => (
        <Card className="p-7" key={classroom.id}>
          <p className="text-sm font-medium text-muted-foreground">{sentenceCase(classroom.batch.mode)}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{classroom.course.name}</h2>
          <p className="mt-3 text-muted-foreground">{classroom.batch.name}</p>
          <div className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p>{classroom.materials.length} materials</p>
            <p>{classroom.recordings.length} videos</p>
            <p>{classroom.assignments.length} assignments</p>
          </div>
          <Link href={`/learning/${classroom.id}`}>
            <Button className="mt-8">Open Learning</Button>
          </Link>
        </Card>
      ))}
    </section>
  );
}
