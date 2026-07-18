"use client";

import { useActionState } from "react";
import type { Course, Room, TimeSlot, User } from "@prisma/client";

import type { PlannerBatch, PlannerEntry, PlannerOverride, PlannerSubject } from "@/services/planner-service";
import { createDailyOverrideAction, createTimetableEntryAction } from "@/features/planner/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, sentenceCase } from "@/lib/format";

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

type PlannerBoardProps = {
  entries: PlannerEntry[];
  overrides: PlannerOverride[];
  timeSlots: TimeSlot[];
  courses: Course[];
  batches: PlannerBatch[];
  faculty: User[];
  subjects: PlannerSubject[];
  rooms: Room[];
};

export function PlannerBoard({ entries, overrides, timeSlots, courses, batches, faculty, subjects, rooms }: PlannerBoardProps) {
  const [entryMessage, entryAction, entryPending] = useActionState(createTimetableEntryAction, undefined);
  const [overrideMessage, overrideAction, overridePending] = useActionState(createDailyOverrideAction, undefined);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-xl font-semibold">Weekly planner</h2>
              <p className="mt-1 text-sm text-muted-foreground">Default schedule by batch, day, period, faculty, subject, and room.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary">Print</Button>
              <Button type="button" variant="secondary">PDF</Button>
              <Button type="button" variant="secondary">WhatsApp</Button>
              <Button type="button" variant="secondary">Image</Button>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {days.map((day) => {
              const dayEntries = entries.filter((entry) => entry.day === day);

              return (
                <div className="rounded-lg border border-border" key={day}>
                  <div className="border-b border-border px-4 py-3">
                    <p className="font-semibold">{sentenceCase(day)}</p>
                  </div>
                  <div className="grid gap-3 p-4">
                    {dayEntries.length ? (
                      dayEntries.map((entry) => (
                        <div className="grid gap-3 rounded-lg bg-muted px-4 py-4 text-sm md:grid-cols-[0.8fr_1fr_1fr_1fr]" key={entry.id}>
                          <p className="font-medium">{entry.timeSlot.name}</p>
                          <p>{entry.batch.name}</p>
                          <p>{entry.subject?.name ?? "Subject not set"}</p>
                          <p>{entry.faculty?.name ?? "Faculty not set"} · {entry.room?.name ?? "Room not set"}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No classes planned.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Add timetable item</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create the default schedule. Today's changes are handled separately.</p>
          <form action={entryAction} className="mt-6 grid gap-4">
            <Select name="courseId">
              <option value="">Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
            <Select name="batchId">
              <option value="">Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.course.name} · {batch.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-4 md:grid-cols-2">
              <Select name="day">
                {days.map((day) => (
                  <option key={day} value={day}>
                    {sentenceCase(day)}
                  </option>
                ))}
              </Select>
              <Select name="timeSlotId">
                <option value="">Period</option>
                {timeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name} · {slot.startsAt}-{slot.endsAt}
                  </option>
                ))}
              </Select>
            </div>
            <Select name="subjectId">
              <option value="">Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.course.name} · {subject.name}
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
            <Select name="roomId">
              <option value="">Room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
            <Textarea name="remarks" placeholder="Remarks" />
            <FormFooter message={entryMessage} pending={entryPending} submit="Add item" />
          </form>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Today's change</h2>
          <p className="mt-1 text-sm text-muted-foreground">Change only one day without touching the default timetable.</p>
          <form action={overrideAction} className="mt-6 grid gap-4">
            <Select name="timetableEntryId">
              <option value="">No default class</option>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {sentenceCase(entry.day)} · {entry.batch.name} · {entry.timeSlot.name}
                </option>
              ))}
            </Select>
            <Field label="Date" name="date" type="date" />
            <Select name="type">
              {["FACULTY_REPLACEMENT", "SUBJECT_REPLACEMENT", "ROOM_CHANGE", "TIME_CHANGE", "CANCEL_CLASS", "EXTRA_CLASS", "SPECIAL_CLASS", "HOLIDAY"].map((type) => (
                <option key={type} value={type}>
                  {sentenceCase(type)}
                </option>
              ))}
            </Select>
            <Select name="facultyId">
              <option value="">Faculty change</option>
              {faculty.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <Select name="subjectId">
              <option value="">Subject change</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
            <Select name="roomId">
              <option value="">Room change</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Starts" name="startsAt" type="time" />
              <Field label="Ends" name="endsAt" type="time" />
            </div>
            <Textarea name="remarks" placeholder="Reason or note" />
            <FormFooter message={overrideMessage} pending={overridePending} submit="Save change" />
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Today's changes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Overrides are logged and do not affect tomorrow.</p>
          <div className="mt-6 space-y-3">
            {overrides.length ? (
              overrides.map((override) => (
                <div className="rounded-lg bg-muted px-4 py-4" key={override.id}>
                  <p className="font-medium">{sentenceCase(override.type)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(override.date)} · {override.timetableEntry?.batch.name ?? "Special item"} · {override.faculty?.name ?? "Faculty unchanged"}
                  </p>
                  {override.remarks ? <p className="mt-2 text-sm">{override.remarks}</p> : null}
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No changes for today.</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} />
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
