"use client";

import { useActionState } from "react";
import type { AcademicYear, Branch, Department } from "@prisma/client";

import type { CourseWithDetails } from "@/services/course-service";
import { createCourseAction, createSubjectAction } from "@/features/courses/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";

type CourseBoardProps = {
  courses: CourseWithDetails[];
  branches: Branch[];
  academicYears: AcademicYear[];
  departments: Department[];
};

export function CourseBoard({ courses, branches, academicYears, departments }: CourseBoardProps) {
  const [courseMessage, courseAction, coursePending] = useActionState(createCourseAction, undefined);
  const [subjectMessage, subjectAction, subjectPending] = useActionState(createSubjectAction, undefined);

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold">Create course</h2>
        <p className="mt-1 text-sm text-muted-foreground">Courses connect branches, academic years, subjects, batches, and future learning content.</p>
        <form action={courseAction} className="mt-6 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Course name" name="name" placeholder="Foundation Mathematics" />
            <Field label="Code" name="code" placeholder="MATH-FND" />
          </div>
          <Textarea name="description" placeholder="Short description" />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Duration" name="duration" placeholder="6 months" />
            <Field label="Category" name="category" placeholder="Science" />
            <Field label="Thumbnail URL" name="thumbnailUrl" placeholder="https://..." />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
            <Select name="departmentId">
              <option value="">Department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Learning modes</p>
            <div className="grid gap-3 md:grid-cols-4">
              {["LIVE", "RECORDED", "OFFLINE", "HYBRID"].map((mode) => (
                <label className="flex h-12 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium" key={mode}>
                  <input name="learningModes" type="checkbox" value={mode} />
                  {sentenceCase(mode)}
                </label>
              ))}
            </div>
          </div>
          <FormFooter message={courseMessage} pending={coursePending} submit="Create course" />
        </form>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {courses.length ? (
            courses.map((course) => (
              <Card className="p-6" key={course.id}>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{course.code}</p>
                    <h3 className="mt-1 text-2xl font-semibold">{course.name}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{course.description ?? "No description added."}</p>
                  </div>
                  <span className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">{sentenceCase(course.status)}</span>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-4">
                  <p>{course.branch?.name ?? "No branch"}</p>
                  <p>{course.academicYear?.name ?? "No year"}</p>
                  <p>{course._count.subjects} subjects</p>
                  <p>{course._count.batches} batches</p>
                </div>
                {course.subjects.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {course.subjects.map((subject) => (
                      <span className="rounded-lg bg-muted px-3 py-2 text-sm" key={subject.id}>
                        {subject.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))
          ) : (
            <Card className="p-10 text-center text-muted-foreground">No courses yet.</Card>
          )}
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Add subject</h2>
          <p className="mt-1 text-sm text-muted-foreground">Subjects are ordered inside a course and reused by the planner.</p>
          <form action={subjectAction} className="mt-6 grid gap-4">
            <Select name="courseId">
              <option value="">Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
            <Field label="Subject name" name="name" placeholder="Algebra" />
            <Field label="Code" name="code" placeholder="ALG" />
            <Field label="Order" name="order" type="number" />
            <Select name="departmentId">
              <option value="">Department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
            <Textarea name="description" placeholder="Notes" />
            <FormFooter message={subjectMessage} pending={subjectPending} submit="Add subject" />
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
