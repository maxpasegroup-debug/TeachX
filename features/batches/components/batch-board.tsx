"use client";

import { useActionState } from "react";
import type { AcademicYear, Branch, Course, User } from "@prisma/client";

import type { BatchWithDetails } from "@/services/batch-service";
import { assignFacultyAction, createBatchAction } from "@/features/batches/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatDate, sentenceCase } from "@/lib/format";

type BatchBoardProps = {
  batches: BatchWithDetails[];
  courses: Course[];
  branches: Branch[];
  academicYears: AcademicYear[];
  faculty: User[];
};

export function BatchBoard({ batches, courses, branches, academicYears, faculty }: BatchBoardProps) {
  const [batchMessage, batchAction, batchPending] = useActionState(createBatchAction, undefined);
  const [facultyMessage, facultyAction, facultyPending] = useActionState(assignFacultyAction, undefined);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold">Create batch</h2>
        <p className="mt-1 text-sm text-muted-foreground">A batch connects a course, faculty, students, capacity, schedule, and future attendance.</p>
        <form action={batchAction} className="mt-6 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Batch name" name="name" placeholder="Morning A" />
            <Select name="courseId">
              <option value="">Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="branchId">
              <option value="">Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            <Select name="academicYearId">
              <option value="">Academic year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Capacity" name="capacity" type="number" />
            <Field label="Maximum strength" name="maximumStrength" type="number" />
            <Field label="Start date" name="startDate" type="date" />
            <Field label="End date" name="endDate" type="date" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Select name="mode">
              <option value="OFFLINE">Offline</option>
              <option value="LIVE">Live</option>
              <option value="RECORDED">Recorded</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
            <Select name="type">
              {["MORNING", "EVENING", "WEEKEND", "WEEKDAY", "ONLINE", "OFFLINE", "HYBRID", "CUSTOM"].map((type) => (
                <option key={type} value={type}>
                  {sentenceCase(type)}
                </option>
              ))}
            </Select>
            <Select name="status">
              {["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"].map((status) => (
                <option key={status} value={status}>
                  {sentenceCase(status)}
                </option>
              ))}
            </Select>
          </div>
          <FormFooter message={batchMessage} pending={batchPending} submit="Create batch" />
        </form>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {batches.length ? (
            batches.map((batch) => (
              <Card className="p-6" key={batch.id}>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{batch.course.name}</p>
                    <h3 className="mt-1 text-2xl font-semibold">{batch.name}</h3>
                  </div>
                  <span className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">{sentenceCase(batch.status)}</span>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-4">
                  <p>{sentenceCase(batch.mode)}</p>
                  <p>{sentenceCase(batch.type)}</p>
                  <p>{batch._count.students}/{batch.maximumStrength} students</p>
                  <p>{formatDate(batch.startDate)}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {batch.faculty.length ? (
                    batch.faculty.map((item) => (
                      <span className="rounded-lg bg-muted px-3 py-2 text-sm" key={item.id}>
                        {item.faculty.name}{item.isLead ? " · Lead" : ""}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">No faculty assigned</span>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-10 text-center text-muted-foreground">No batches yet.</Card>
          )}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Assign faculty</h2>
          <p className="mt-1 text-sm text-muted-foreground">This relation will power attendance, timetable, and teacher dashboards later.</p>
          <form action={facultyAction} className="mt-6 grid gap-4">
            <Select name="batchId">
              <option value="">Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.course.name} · {batch.name}
                </option>
              ))}
            </Select>
            <Select name="facultyId">
              <option value="">Faculty</option>
              {faculty.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input className="h-4 w-4" name="isLead" type="checkbox" />
              Lead faculty
            </label>
            <FormFooter message={facultyMessage} pending={facultyPending} submit="Assign faculty" />
          </form>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} type={type} />
    </div>
  );
}

function FormFooter({ message, pending, submit }: { message?: string; pending: boolean; submit: string }) {
  return (
    <div className="flex items-center gap-4">
      <Button disabled={pending} type="submit">
        {pending ? "Saving" : submit}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
