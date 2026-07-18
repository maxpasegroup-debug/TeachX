"use client";

import { useMemo, useState, useActionState } from "react";

import { saveBookmarkAction, saveStudentNoteAction, saveVideoProgressAction, submitAssignmentAction } from "@/features/learning/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StudentClassroom } from "@/services/learning-service";
import { formatDate, sentenceCase } from "@/lib/format";

export function StudentClassroomPage({ classroom }: { classroom: StudentClassroom }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return classroom;
    return {
      ...classroom,
      materials: classroom.materials.filter((item) => [item.title, item.chapter, item.topic].some((value) => value?.toLowerCase().includes(term))),
      assignments: classroom.assignments.filter((item) => [item.title, item.instructions].some((value) => value?.toLowerCase().includes(term))),
      recordings: classroom.recordings.filter((item) => item.title.toLowerCase().includes(term)),
      announcements: classroom.announcements.filter((item) => [item.title, item.message].some((value) => value.toLowerCase().includes(term)))
    };
  }, [classroom, search]);

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <p className="text-sm font-medium text-muted-foreground">{classroom.batch.name}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{classroom.course.name}</h1>
        <p className="mt-3 text-lg text-muted-foreground">One place for lessons, videos, materials, assignments, attendance, and progress.</p>
        <Input className="mt-8 max-w-xl" onChange={(event) => setSearch(event.target.value)} placeholder="Search lessons, materials, assignments, videos, announcements" value={search} />
      </Card>
      <Overview classroom={classroom} />
      <Recorded classroom={classroom} recordings={filtered.recordings} />
      <Notes classroomId={classroom.id} notes={classroom.studentNotes} />
      <Live classroom={classroom} />
      <Materials classroomId={classroom.id} materials={filtered.materials} />
      <Assignments assignments={filtered.assignments} classroomId={classroom.id} />
      <Attendance classroom={classroom} />
      <TestsPlaceholder />
      <Announcements announcements={filtered.announcements} />
      <DiscussionPlaceholder />
      <Progress classroom={classroom} />
    </div>
  );
}

function Overview({ classroom }: { classroom: StudentClassroom }) {
  const today = new Date().toLocaleDateString("en", { weekday: "long" }).toUpperCase();
  const lesson = classroom.batch.timetableEntries.find((entry) => entry.day === today);
  return <Card className="p-7"><Title title="Overview" note="Today lesson and your next learning step." /><div className="mt-6 grid gap-4 md:grid-cols-3"><Mini label="Today Lesson" value={lesson?.subject?.name ?? "No lesson today"} /><Mini label="Materials" value={classroom.materials.length.toString()} /><Mini label="Assignments" value={classroom.assignments.length.toString()} /></div></Card>;
}

function Recorded({ classroom, recordings }: { classroom: StudentClassroom; recordings: StudentClassroom["recordings"] }) {
  const [message, action, pending] = useActionState(saveVideoProgressAction, undefined);
  return (
    <Card className="p-7">
      <Title title="Recorded Classes" note="Continue watching, bookmark, take notes, and mark complete." />
      <div className="mt-6 space-y-4">
        {recordings.length ? recordings.map((recording) => (
          <form action={action} className="rounded-lg bg-muted p-4" key={recording.id}>
            <input name="classroomId" type="hidden" value={classroom.id} />
            <input name="recordingId" type="hidden" value={recording.id} />
            <p className="font-medium">{recording.title}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Input name="lastPosition" placeholder="Last position" type="number" />
              <Input name="duration" placeholder="Duration" type="number" />
              <Select name="playbackSpeed"><option value="1">1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></Select>
              <label className="flex items-center gap-2 text-sm"><input name="completed" type="checkbox" /> Mark complete</label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={pending} type="submit" variant="secondary">Save Progress</Button>
              <AiButtons />
            </div>
          </form>
        )) : <Empty text="No recorded classes yet." />}
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </Card>
  );
}

function Notes({ classroomId, notes }: { classroomId: string; notes: StudentClassroom["studentNotes"] }) {
  const [message, action, pending] = useActionState(saveStudentNoteAction, undefined);
  return (
    <Card className="p-7">
      <Title title="Notes" note="Write your own notes. Later AI can explain, summarize, and improve understanding." />
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="classroomId" type="hidden" value={classroomId} />
        <Select name="targetType"><option value="LESSON">Lesson</option><option value="RECORDING">Recording</option><option value="MATERIAL">Material</option><option value="ASSIGNMENT">Assignment</option></Select>
        <Input name="targetId" placeholder="Optional item ID" />
        <Input name="title" placeholder="Note title" />
        <Textarea name="body" placeholder="Write your note" />
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} type="submit">Save Note</Button>
          <Button disabled type="button" variant="secondary">Explain Topic</Button>
          <Button disabled type="button" variant="secondary">Improve Understanding</Button>
        </div>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <SimpleList items={notes.map((note) => `${note.title} - ${sentenceCase(note.targetType)}`)} empty="No notes yet." />
    </Card>
  );
}

function Live({ classroom }: { classroom: StudentClassroom }) {
  return <Card className="p-7"><Title title="Live Classes" note="Upcoming sessions, join button, previous sessions, and attendance status." /><SimpleList items={classroom.liveSessions.map((item) => `${item.title} - ${item.scheduledAt ? formatDate(item.scheduledAt) : "Not scheduled"} - ${sentenceCase(item.status)}`)} empty="No live classes scheduled." action="Join" /></Card>;
}

function Materials({ classroomId, materials }: { classroomId: string; materials: StudentClassroom["materials"] }) {
  return <Card className="p-7"><Title title="Study Materials" note="Organized by subject, chapter, and topic." /><SimpleList items={materials.map((item) => `${item.title} - ${item.subject?.name ?? "Subject"} - ${item.chapter ?? "Chapter"}`)} empty="No materials yet." action="Download" /><BookmarkForm classroomId={classroomId} /></Card>;
}

function Assignments({ classroomId, assignments }: { classroomId: string; assignments: StudentClassroom["assignments"] }) {
  const [message, action, pending] = useActionState(submitAssignmentAction, undefined);
  return (
    <Card className="p-7">
      <Title title="Assignments" note="View instructions, due dates, submit work, and see status." />
      <div className="mt-6 space-y-4">
        {assignments.length ? assignments.map((assignment) => {
          const submission = assignment.submissions[0];
          return (
            <form action={action} className="rounded-lg bg-muted p-4" key={assignment.id}>
              <input name="classroomId" type="hidden" value={classroomId} />
              <input name="assignmentId" type="hidden" value={assignment.id} />
              <p className="font-medium">{assignment.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">Due {formatDate(assignment.dueDate)} - {sentenceCase(submission?.status ?? "PENDING")}</p>
              <p className="mt-3 text-sm">{assignment.instructions}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input name="attachmentUrl" placeholder="Submission URL" />
                <Input name="remarks" placeholder="Remarks" />
                <Button disabled={pending} type="submit">Submit</Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Teacher feedback will appear here later.</p>
            </form>
          );
        }) : <Empty text="No assignments yet." />}
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </Card>
  );
}

function Attendance({ classroom }: { classroom: StudentClassroom }) {
  const records = classroom.attendanceSessions.flatMap((session) => session.records);
  const total = records.length || 1;
  const present = records.filter((record) => record.status === "PRESENT").length;
  const percentage = Math.round((present / total) * 100);
  return <Card className="p-7"><Title title="Attendance" note="Monthly view foundation with planner-linked attendance records." /><div className="mt-6 grid gap-4 md:grid-cols-4"><Mini label="Percentage" value={`${percentage}%`} /><Mini label="Present" value={present.toString()} /><Mini label="Absent" value={records.filter((record) => record.status === "ABSENT").length.toString()} /><Mini label="Late" value={records.filter((record) => record.status === "LATE").length.toString()} /></div></Card>;
}

function Progress({ classroom }: { classroom: StudentClassroom }) {
  const progress = classroom.learningProgress[0];
  return <Card className="p-7"><Title title="Progress" note="Course completion, assignment progress, attendance, study streak, and achievements." /><div className="mt-6 grid gap-4 md:grid-cols-4"><Mini label="Course" value={`${progress?.completion ?? 0}%`} /><Mini label="Assignments" value={`${progress?.assignmentProgress ?? 0}%`} /><Mini label="Attendance" value={`${progress?.attendancePercentage ?? 0}%`} /><Mini label="Study Streak" value={`${progress?.studyStreak ?? 0} days`} /></div><p className="mt-5 rounded-lg bg-muted px-4 py-4 text-sm text-muted-foreground">Achievements will appear here later.</p></Card>;
}

function BookmarkForm({ classroomId }: { classroomId: string }) {
  const [message, action, pending] = useActionState(saveBookmarkAction, undefined);
  return <form action={action} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"><input name="classroomId" type="hidden" value={classroomId} /><Select name="targetType"><option value="MATERIAL">Material</option><option value="RECORDING">Recording</option><option value="ASSIGNMENT">Assignment</option></Select><Input name="targetId" placeholder="Item ID" /><Input name="label" placeholder="Bookmark note" /><Button disabled={pending} type="submit" variant="secondary">Bookmark</Button>{message ? <p className="text-sm text-muted-foreground">{message}</p> : null}</form>;
}

function TestsPlaceholder() { return <Card className="p-7"><Title title="Tests" note="Upcoming tests will plug in after the exam engine." /><Empty text="No tests yet." /></Card>; }
function DiscussionPlaceholder() { return <Card className="p-7"><Title title="Discussion" note="Discussion threads are prepared for a later phase." /><Empty text="Discussion will open later." /></Card>; }
function Announcements({ announcements }: { announcements: StudentClassroom["announcements"] }) { return <Card className="p-7"><Title title="Announcements" note="Classroom updates from your teacher." /><SimpleList items={announcements.map((item) => `${item.title} - ${formatDate(item.createdAt)}`)} empty="No announcements yet." /></Card>; }
function AiButtons() { return <><Button disabled type="button" variant="secondary">Summarize Lesson</Button><Button disabled type="button" variant="secondary">Ask AI</Button><Button disabled type="button" variant="secondary">Practice Questions</Button></>; }
function Title({ title, note }: { title: string; note: string }) { return <div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p></div>; }
function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>; }
function Empty({ text }: { text: string }) { return <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">{text}</p>; }
function SimpleList({ items, empty, action }: { items: string[]; empty: string; action?: string }) { return <div className="mt-6 space-y-3">{items.length ? items.map((item) => <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-4 text-sm" key={item}><span>{item}</span>{action ? <Button disabled type="button" variant="secondary">{action}</Button> : null}</div>) : <Empty text={empty} />}</div>; }
