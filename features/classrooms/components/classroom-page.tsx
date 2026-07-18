"use client";

import { useMemo, useState, useActionState } from "react";
import Link from "next/link";

import { createAnnouncementAction, createAssignmentAction, createLiveSessionAction, createMaterialAction, createRecordingAction, saveAttendanceAction } from "@/features/classrooms/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ClassroomWithDetails } from "@/services/classroom-service";
import { formatDate, sentenceCase } from "@/lib/format";
import { getInitials } from "@/lib/utils";

export function ClassroomPage({ classroom }: { classroom: ClassroomWithDetails }) {
  const [search, setSearch] = useState("");
  const subjects = classroom.course.subjects ?? [];
  const searchable = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return { materials: classroom.materials, assignments: classroom.assignments, recordings: classroom.recordings, students: classroom.batch.students };
    return {
      materials: classroom.materials.filter((item) => [item.title, item.chapter, item.topic, item.notes].some((value) => value?.toLowerCase().includes(term))),
      assignments: classroom.assignments.filter((item) => [item.title, item.instructions].some((value) => value?.toLowerCase().includes(term))),
      recordings: classroom.recordings.filter((item) => item.title.toLowerCase().includes(term)),
      students: classroom.batch.students.filter((item) => item.student.name.toLowerCase().includes(term))
    };
  }, [classroom, search]);

  return (
    <div className="space-y-8">
      <Card className="p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{classroom.course.name}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{classroom.batch.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{sentenceCase(classroom.batch.mode)} classroom · {classroom.batch.students.length} students</p>
          </div>
          <Input className="md:max-w-sm" onChange={(event) => setSearch(event.target.value)} placeholder="Search classroom" value={search} />
        </div>
      </Card>

      <OverviewSection classroom={classroom} />
      <LiveClassSection classroomId={classroom.id} />
      <RecordedClassesSection classroom={classroom} recordings={searchable.recordings} />
      <StudyMaterialsSection classroom={classroom} materials={searchable.materials} subjects={subjects} />
      <AssignmentsSection assignments={searchable.assignments} classroom={classroom} subjects={subjects} />
      <AttendanceSection classroom={classroom} />
      <StudentsSection students={searchable.students} />
      <AnnouncementsSection classroom={classroom} />
    </div>
  );
}

function OverviewSection({ classroom }: { classroom: ClassroomWithDetails }) {
  const today = new Date().toLocaleDateString("en", { weekday: "long" }).toUpperCase();
  const todaysClass = classroom.batch.timetableEntries.find((entry) => entry.day === today);
  const nextSession = classroom.liveSessions.find((session) => session.status === "SCHEDULED");

  return (
    <Card className="p-7">
      <SectionTitle title="Overview" note="Today's class, announcements, next session, and a quick summary." />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Mini label="Today's Class" value={todaysClass ? `${todaysClass.timeSlot.name} · ${todaysClass.subject?.name ?? "Subject"}` : "No class today"} />
        <Mini label="Announcements" value={classroom.announcements.length.toString()} />
        <Mini label="Next Session" value={nextSession?.scheduledAt ? formatDate(nextSession.scheduledAt) : "Not scheduled"} />
        <Mini label="Quick Summary" value={`${classroom.materials.length} materials · ${classroom.assignments.length} assignments`} />
      </div>
    </Card>
  );
}

function LiveClassSection({ classroomId }: { classroomId: string }) {
  const [message, action, pending] = useActionState(createLiveSessionAction, undefined);
  return (
    <Card className="p-7">
      <SectionTitle title="Live Class" note="Live providers can plug in later. The classroom workflow is ready now." />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Button className="h-16 text-lg" disabled type="button">Start Live Class</Button>
        <form action={action} className="grid gap-3">
          <input name="classroomId" type="hidden" value={classroomId} />
          <Input name="title" placeholder="Session title" />
          <Input name="scheduledAt" type="datetime-local" />
          <Button disabled={pending} type="submit" variant="secondary">{pending ? "Scheduling" : "Schedule Live Class"}</Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </form>
      </div>
      <Button className="mt-4" disabled type="button" variant="ghost">View Previous Sessions</Button>
    </Card>
  );
}

function RecordedClassesSection({ classroom, recordings }: { classroom: ClassroomWithDetails; recordings: ClassroomWithDetails["recordings"] }) {
  const [message, action, pending] = useActionState(createRecordingAction, undefined);
  return (
    <Card className="p-7">
      <SectionTitle title="Recorded Classes" note="Upload recordings and prepare the video editor queue for a later phase." />
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="classroomId" type="hidden" value={classroom.id} />
        <Input name="title" placeholder="Recording title" />
        <Input name="videoUrl" placeholder="Recording URL" />
        <Textarea name="editorNotes" placeholder="Video editor notes" />
        <div>
          <Button disabled={pending} type="submit">{pending ? "Saving" : "Upload Recording"}</Button>
          {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </form>
      <SimpleList items={recordings.map((recording) => `${recording.title} · ${sentenceCase(recording.status)} · v${recording.version}`)} empty="No recordings yet." />
    </Card>
  );
}

function StudyMaterialsSection({ classroom, materials, subjects }: { classroom: ClassroomWithDetails; materials: ClassroomWithDetails["materials"]; subjects: ClassroomWithDetails["course"]["subjects"] }) {
  const [message, action, pending] = useActionState(createMaterialAction, undefined);
  return (
    <Card className="p-7">
      <SectionTitle title="Study Materials" note="Arrange by subject, chapter, and topic. AI hooks are built into the workflow." />
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="classroomId" type="hidden" value={classroom.id} />
        <Input name="title" placeholder="Material title" />
        <Select name="type"><option value="PDF">PDF</option><option value="PPT">PPT</option><option value="IMAGE">Image</option><option value="NOTES">Notes</option></Select>
        <Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        <Input name="chapter" placeholder="Chapter" />
        <Input name="topic" placeholder="Topic" />
        <Input name="fileUrl" placeholder="File URL" />
        <Select name="publishStatus"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></Select>
        <Textarea name="notes" placeholder="Notes. Later: Summarize, Generate Quiz, Generate Homework." />
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} type="submit">{pending ? "Saving" : "Upload Material"}</Button>
          <Button disabled type="button" variant="secondary">Summarize</Button>
          <Button disabled type="button" variant="secondary">Generate Quiz</Button>
        </div>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <SimpleList items={materials.map((material) => `${material.title} · ${sentenceCase(material.type)} · ${material.subject?.name ?? "No subject"}`)} empty="No materials yet." />
    </Card>
  );
}

function AssignmentsSection({ classroom, assignments, subjects }: { classroom: ClassroomWithDetails; assignments: ClassroomWithDetails["assignments"]; subjects: ClassroomWithDetails["course"]["subjects"] }) {
  const [message, action, pending] = useActionState(createAssignmentAction, undefined);
  return (
    <Card className="p-7">
      <SectionTitle title="Assignments" note="Create work, due dates, instructions, attachments, and review status." />
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="classroomId" type="hidden" value={classroom.id} />
        <Input name="title" placeholder="Assignment title" />
        <Input name="dueDate" type="date" />
        <Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        <Select name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></Select>
        <Input name="attachmentUrl" placeholder="Attachment URL" />
        <Input name="aiPrompt" placeholder="Generate with AI prompt" />
        <Textarea name="instructions" placeholder="Instructions. Later: Generate with AI, Improve Instructions." />
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} type="submit">{pending ? "Saving" : "Create Assignment"}</Button>
          <Button disabled type="button" variant="secondary">Generate with AI</Button>
          <Button disabled type="button" variant="secondary">Improve Instructions</Button>
        </div>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <SimpleList items={assignments.map((assignment) => `${assignment.title} · ${sentenceCase(assignment.status)} · ${assignment.submissions.length} submissions`)} empty="No assignments yet." />
    </Card>
  );
}

function AttendanceSection({ classroom }: { classroom: ClassroomWithDetails }) {
  const [message, action, pending] = useActionState(saveAttendanceAction, undefined);
  return (
    <Card className="p-7">
      <SectionTitle title="Attendance" note="One-click attendance. Today's batch comes from this classroom and planner data." />
      <form action={action} className="mt-6">
        <input name="classroomId" type="hidden" value={classroom.id} />
        <div className="space-y-3">
          {classroom.batch.students.length ? classroom.batch.students.map((item) => (
            <div className="grid gap-3 rounded-lg bg-muted px-4 py-4 md:grid-cols-[1fr_auto]" key={item.id}>
              <p className="font-medium">{item.student.name}</p>
              <Select className="md:w-40" name={`student-${item.studentId}`} defaultValue="PRESENT">
                <option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option><option value="EXCUSED">Excused</option>
              </Select>
            </div>
          )) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No students in this batch yet.</p>}
        </div>
        <Textarea className="mt-4" name="remarks" placeholder="Remarks" />
        <Button className="mt-4" disabled={pending} type="submit">{pending ? "Saving" : "Save Attendance"}</Button>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function StudentsSection({ students }: { students: ClassroomWithDetails["batch"]["students"] }) {
  return (
    <Card className="p-7">
      <SectionTitle title="Students" note="Quick view only. Editing belongs to future student management." />
      <div className="mt-6 grid gap-3">
        {students.length ? students.map((item) => (
          <div className="grid gap-4 rounded-lg bg-muted px-4 py-4 md:grid-cols-[auto_1fr_1fr_1fr]" key={item.id}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface font-semibold">{getInitials(item.student.name)}</span>
            <p className="font-medium">{item.student.name}</p>
            <p className="text-sm text-muted-foreground">Roll Number: Later</p>
            <p className="text-sm text-muted-foreground">Attendance and assignment status ready</p>
          </div>
        )) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No students assigned yet.</p>}
      </div>
    </Card>
  );
}

function AnnouncementsSection({ classroom }: { classroom: ClassroomWithDetails }) {
  const [message, action, pending] = useActionState(createAnnouncementAction, undefined);
  return (
    <Card className="p-7">
      <SectionTitle title="Announcements" note="Post updates. Students will receive notifications when their portal is added." />
      <form action={action} className="mt-6 grid gap-4">
        <input name="classroomId" type="hidden" value={classroom.id} />
        <Input name="title" placeholder="Title" />
        <Textarea name="message" placeholder="Message. Later: Improve Writing, Translate." />
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} type="submit">{pending ? "Posting" : "Post Announcement"}</Button>
          <Button disabled type="button" variant="secondary">Improve Writing</Button>
          <Button disabled type="button" variant="secondary">Translate Later</Button>
        </div>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <SimpleList items={classroom.announcements.map((announcement) => `${announcement.title} · ${formatDate(announcement.createdAt)}`)} empty="No announcements yet." />
      <Link className="mt-6 inline-block text-sm font-medium text-muted-foreground hover:text-foreground" href="/classrooms">Back to My Classrooms</Link>
    </Card>
  );
}

function SectionTitle({ title, note }: { title: string; note: string }) {
  return <div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>;
}

function SimpleList({ items, empty }: { items: string[]; empty: string }) {
  return <div className="mt-6 space-y-2">{items.length ? items.map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm font-medium" key={item}>{item}</p>) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">{empty}</p>}</div>;
}
