"use client";

import { useMemo, useState, useActionState, useEffect } from "react";
import Link from "next/link";

import { addStandaloneStudentAction, createAnnouncementAction, createAssignmentAction, createLiveSessionAction, createMaterialAction, createRecordingAction, removeStandaloneStudentAction, saveAttendanceAction, reviewAssignmentSubmissionAction, transitionAssignmentStatusAction, getAssignmentReviewPayloadAction, getClassroomAssignmentDoubtsAction, replyAssignmentDoubtAction, updateStandaloneStudentAction } from "@/features/classrooms/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ClassroomWithDetails } from "@/services/classroom-service";
import { formatDate, sentenceCase } from "@/lib/format";
import { getInitials } from "@/lib/utils";

export function ClassroomPage({ classroom, canManageRoster = false }: { classroom: ClassroomWithDetails; canManageRoster?: boolean }) {
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
      <StudentsSection canManageRoster={canManageRoster} classroomId={classroom.id} students={searchable.students} />
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
    <Card className="p-7" id="materials">
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
    <Card className="p-7" id="assignments">
      <SectionTitle title="Assignments" note="Create work, due dates, instructions, attachments, and review status." />
      <form action={action} className="mt-6 grid gap-4 md:grid-cols-2">
        <input name="classroomId" type="hidden" value={classroom.id} />
        <Input name="title" placeholder="Assignment title" />
        <Input name="dueDate" type="date" />
        <Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        <Select name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></Select>
        <Input name="attachmentUrl" placeholder="Attachment URL" />
        <Input name="aiPrompt" placeholder="Generate with AI prompt" /><Input name="maxMarks" type="number" min="0.01" step="0.01" placeholder="Maximum marks (required to grade)" /><Label className="flex items-center gap-2"><input type="checkbox" name="allowResubmission" defaultChecked/> Permit resubmission only after teacher return</Label>
        <Textarea name="instructions" placeholder="Instructions. Later: Generate with AI, Improve Instructions." />
        <div className="flex flex-wrap gap-3">
          <Button disabled={pending} type="submit">{pending ? "Saving" : "Create Assignment"}</Button>
          <Button disabled type="button" variant="secondary">Generate with AI</Button>
          <Button disabled type="button" variant="secondary">Improve Instructions</Button>
        </div>
      </form>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      <div className="mt-5 space-y-4">{assignments.map(assignment=><div key={assignment.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><b>{assignment.title} · {sentenceCase(assignment.status)}</b><AssignmentTransitionForm classroomId={classroom.id} assignmentId={assignment.id} status={assignment.status}/></div><p className="text-sm text-muted-foreground">{assignment.submissions.length} student records · Max marks {assignment.maxMarks??"not configured"}</p>{assignment.submissions.filter(s=>s.status!=="PENDING").map(s=><ReviewSubmissionForm key={s.id} classroomId={classroom.id} submissionId={s.id} status={s.status} studentName={classroom.batch.students.find(x=>x.studentId===s.studentId)?.student.name??"Student"} maxMarks={assignment.maxMarks}/>)}</div>)}{!assignments.length?<p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">No assignments yet.</p>:null}</div><ClassroomDoubts classroomId={classroom.id}/>
    </Card>
  );
}

function ClassroomDoubts({classroomId}:{classroomId:string}){const[rows,setRows]=useState<Awaited<ReturnType<typeof getClassroomAssignmentDoubtsAction>>>([]);useEffect(()=>{getClassroomAssignmentDoubtsAction(classroomId).then(setRows).catch(()=>setRows([]))},[classroomId]);return <div className="mt-6"><h3 className="font-semibold">Private assignment doubts</h3>{rows.map(x=><article key={x.id} className="mt-3 rounded-lg border p-4"><b>{x.assignment.title} · {x.student.name} · {x.status}</b>{x.messages.map(m=><p key={m.id} className="mt-2 text-sm"><span className="font-medium">{m.author?.name??"Former user"}:</span> {m.body} <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span></p>)}<DoubtReplyForm classroomId={classroomId} doubtId={x.id}/></article>)}{!rows.length?<p className="mt-3 text-sm text-muted-foreground">No assignment doubts.</p>:null}</div>}
function DoubtReplyForm({classroomId,doubtId}:{classroomId:string;doubtId:string}){const[msg,action,pending]=useActionState(replyAssignmentDoubtAction,undefined);return <form action={action} className="mt-3 flex gap-2"><input type="hidden" name="classroomId" value={classroomId}/><input type="hidden" name="doubtId" value={doubtId}/><Input name="body" maxLength={1000} placeholder="Reply privately to this student"/><Button disabled={pending}>Reply</Button>{msg?<span className="text-xs">{msg}</span>:null}</form>}

function AssignmentTransitionForm({classroomId,assignmentId,status}:{classroomId:string;assignmentId:string;status:string}){const[message,action,pending]=useActionState(transitionAssignmentStatusAction,undefined);if(status==="CLOSED")return null;return <form action={action} className="flex items-center gap-2"><input type="hidden" name="classroomId" value={classroomId}/><input type="hidden" name="assignmentId" value={assignmentId}/><input type="hidden" name="target" value={status==="DRAFT"?"PUBLISHED":"CLOSED"}/><Button type="submit" disabled={pending} variant="secondary">{pending?"Updating":status==="DRAFT"?"Publish":"Close"}</Button>{message?<span className="text-xs">{message}</span>:null}</form>}
function ReviewSubmissionForm({classroomId,submissionId,status,studentName,maxMarks}:{classroomId:string;submissionId:string;status:string;studentName:string;maxMarks:number|null}){const[message,action,pending]=useActionState(reviewAssignmentSubmissionAction,undefined),[payload,setPayload]=useState<Awaited<ReturnType<typeof getAssignmentReviewPayloadAction>>|null>(null);useEffect(()=>{getAssignmentReviewPayloadAction(submissionId).then(setPayload).catch(()=>setPayload(null))},[submissionId]);return <form action={action} className="mt-4 grid gap-3 rounded-lg bg-muted p-4 md:grid-cols-2"><input type="hidden" name="classroomId" value={classroomId}/><input type="hidden" name="submissionId" value={submissionId}/><p className="font-medium md:col-span-2">Review {studentName}</p>{payload?<div className="space-y-3 rounded-lg border bg-background p-4 md:col-span-2"><b>Authorized immutable versions</b>{payload.revisions.map(v=><article key={v.id} className="border-l-4 border-primary pl-3"><p className="text-sm font-semibold">Version {v.version} · {v.displayState} · {v.submittedAt?new Date(v.submittedAt).toLocaleString():"Date unavailable"}</p><p className="mt-2 whitespace-pre-wrap text-sm">{v.text??"Attachment-only submission"}</p>{v.attachments.map((a,i)=><a key={`${a.url}-${i}`} href={a.url} target="_blank" rel="noreferrer" className="block text-sm font-medium text-primary underline">External: {a.name} ({a.mediaType})</a>)}{v.feedback?<p className="mt-2 text-xs">Prior feedback: {v.feedback}</p>:null}<p className="text-xs text-muted-foreground">Reviewer: {v.reviewer?.name??"Not reviewed"} · Marks {v.marks??"Not graded"}/{v.maxMarks??"—"}</p></article>)}</div>:<p className="text-xs text-muted-foreground md:col-span-2">Loading authorized submission evidence…</p>}{status==="SUBMITTED"||status==="LATE"?<><Input name="marks" type="number" min="0" max={maxMarks??undefined} step="0.01" placeholder={maxMarks?`Marks / ${maxMarks}`:"Configure max marks before grading"}/><fieldset className="space-y-2 md:col-span-2"><legend className="text-sm font-medium">Rubric criteria (optional; totals must reconcile exactly)</legend>{[0,1,2].map(i=><div key={i} className="grid gap-2 md:grid-cols-[1fr_120px_120px]"><Input name="criterion" maxLength={120} placeholder={`Criterion ${i+1}`}/><Input name="criterionScore" type="number" min="0" step="0.01" placeholder="Awarded"/><Input name="criterionMaximum" type="number" min="0.01" step="0.01" placeholder="Maximum"/></div>)}</fieldset><Textarea name="feedback" maxLength={8000} placeholder="Teacher feedback and improvement suggestions"/><div className="flex flex-wrap items-start gap-2"><Button disabled={pending} name="decision" value="COMPLETE">Complete review</Button><Button disabled={pending} name="decision" value="RETURN" variant="secondary">Return for revision</Button></div>{message?<p className="text-sm md:col-span-2">{message}</p>:null}</>:<p className="text-sm md:col-span-2">This returned submission remains read-only until the student submits a new version.</p>}<p className="text-xs text-muted-foreground md:col-span-2">AI feedback suggestion is unavailable; nothing is auto-published or auto-graded.</p></form>}
function AttendanceSection({ classroom }: { classroom: ClassroomWithDetails }) {
  const [message, action, pending] = useActionState(saveAttendanceAction, undefined);
  return (
    <Card className="p-7" id="attendance">
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

function StudentsSection({ classroomId, students, canManageRoster }: { classroomId: string; students: ClassroomWithDetails["batch"]["students"]; canManageRoster: boolean }) {
  const [message, addAction, adding] = useActionState(addStandaloneStudentAction, undefined);
  return <Card className="p-7" id="students">
    <SectionTitle title="Students" note={canManageRoster ? "Add your students, then use this roster for attendance and assignments." : "Students assigned to this class."} />
    {canManageRoster ? <form action={addAction} className="mt-6 grid gap-4 sm:grid-cols-2">
      <input name="classroomId" type="hidden" value={classroomId} />
      <div><Label htmlFor="studentName">Student name</Label><Input className="mt-2" id="studentName" name="name" placeholder="Student's full name" required /></div>
      <div><Label htmlFor="studentEmail">Email (optional)</Label><Input className="mt-2" id="studentEmail" name="email" placeholder="student@example.com" type="email" /></div>
      <div className="sm:col-span-2"><Button className="min-h-11" disabled={adding} type="submit">{adding ? "Adding student" : "Add student"}</Button>{message ? <p className="mt-3 text-sm" role="status">{message}</p> : null}</div>
    </form> : null}
    <div className="mt-6 grid gap-3">
      {students.length ? students.map((item) => <StudentRosterRow canManage={canManageRoster} classroomId={classroomId} item={item} key={item.id} />) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-muted-foreground">{canManageRoster ? "Add your students to begin attendance and assignments." : "No students assigned yet."}</p>}
    </div>
  </Card>;
}

function StudentRosterRow({ classroomId, item, canManage }: { classroomId: string; item: ClassroomWithDetails["batch"]["students"][number]; canManage: boolean }) {
  const [updateMessage, updateAction, updating] = useActionState(updateStandaloneStudentAction, undefined);
  const [removeMessage, removeAction, removing] = useActionState(removeStandaloneStudentAction, undefined);
  return <div className="rounded-lg bg-muted px-4 py-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface font-semibold">{getInitials(item.student.name)}</span>
      <div className="min-w-0 flex-1"><p className="break-words font-medium">{item.student.name}</p><p className="text-sm text-muted-foreground">Ready for attendance, assignments, and review</p></div>
    </div>
    {canManage && item.student.status === "INVITED" ? <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <form action={updateAction} className="flex min-w-0 flex-col gap-2 sm:flex-row"><input name="classroomId" type="hidden" value={classroomId} /><input name="studentId" type="hidden" value={item.studentId} /><Input aria-label={`Edit ${item.student.name}`} defaultValue={item.student.name} name="name" required /><Button className="min-h-11" disabled={updating} type="submit" variant="secondary">{updating ? "Saving" : "Save name"}</Button></form>
      <form action={removeAction}><input name="classroomId" type="hidden" value={classroomId} /><input name="studentId" type="hidden" value={item.studentId} /><Button className="min-h-11" disabled={removing} type="submit" variant="ghost">{removing ? "Removing" : "Remove"}</Button></form>
      {updateMessage || removeMessage ? <p className="text-sm sm:col-span-2" role="status">{updateMessage ?? removeMessage}</p> : null}
    </div> : null}
  </div>;
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
