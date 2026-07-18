"use client";

import { useActionState, useMemo, useState } from "react";

import { approveContentAction, archiveContentAction, createContentAction, createContentFolderAction, duplicateContentAction, publishContentAction, reviewContentAction, submitContentReviewAction } from "@/features/content/actions";
import type { getContentAnalytics } from "@/services/content-analytics-service";
import type { getContentStudioOverview } from "@/services/content-service";
import type { getApprovalQueues } from "@/services/review-service";
import type { getStorageDashboard } from "@/services/storage-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";

type ContentStudioProps = {
  overview: Awaited<ReturnType<typeof getContentStudioOverview>>;
  queues: Awaited<ReturnType<typeof getApprovalQueues>>;
  analytics: Awaited<ReturnType<typeof getContentAnalytics>>;
  storage: Awaited<ReturnType<typeof getStorageDashboard>>;
  readOnly?: boolean;
};

export function ContentStudio({ overview, queues, analytics, storage, readOnly = false }: ContentStudioProps) {
  const [search, setSearch] = useState("");
  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return overview.items;
    return overview.items.filter((item) => [item.title, item.description, item.course.name, item.subject?.name, item.chapter?.name, item.topic?.name, item.createdBy?.name].some((value) => value?.toLowerCase().includes(term)));
  }, [overview.items, search]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Kpi label="Content" value={overview.items.length.toString()} />
        <Kpi label="Published" value={overview.items.filter((item) => item.status === "PUBLISHED").length.toString()} />
        <Kpi label="Pending Review" value={(queues.videoEditorQueue.length + queues.academicHeadQueue.length).toString()} />
        <Kpi label="Storage Used" value={formatBytes(storage.usedBytes)} />
      </section>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Search video, PDF, topic, teacher, chapter or file</p>
        <Input className="mt-3 max-w-2xl" onChange={(event) => setSearch(event.target.value)} placeholder="Search lessons and materials" value={search} />
      </Card>

      {!readOnly ? (
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <UploadCenter overview={overview} />
          <FolderPanel overview={overview} />
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Library items={filteredItems} readOnly={readOnly} />
        <ReviewQueues queues={queues} readOnly={readOnly} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AnalyticsPanel analytics={analytics} />
        <StoragePanel storage={storage} />
      </section>
    </div>
  );
}

function UploadCenter({ overview }: { overview: ContentStudioProps["overview"] }) {
  const [message, action, pending] = useActionState(createContentAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Teacher Upload Center</h2>
      <p className="mt-1 text-sm text-muted-foreground">Prepare a lesson. Save draft, submit for review, or publish if allowed.</p>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="title" placeholder="Lesson title" />
        <Textarea name="description" placeholder="Short description or notes" />
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="courseId"><option value="">Course</option>{overview.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
          <Select name="subjectId"><option value="">Subject</option>{overview.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
          <Select name="chapterId"><option value="">Chapter</option>{overview.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</Select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="topicId"><option value="">Topic</option>{overview.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</Select>
          <Select name="classroomId"><option value="">Classroom</option>{overview.classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}</Select>
          <Select name="batchId"><option value="">Batch</option>{overview.batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="type">
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
            <option value="PPT">PPT</option>
            <option value="IMAGE">Image</option>
            <option value="AUDIO">Audio</option>
            <option value="ZIP">ZIP</option>
            <option value="EXTERNAL_LINK">External Link</option>
            <option value="NOTES">Notes</option>
            <option value="WORKSHEET">Worksheet</option>
            <option value="QUESTION_PAPER">Question Paper</option>
            <option value="ANSWER_KEY">Answer Key</option>
            <option value="REFERENCE">Reference</option>
          </Select>
          <Select name="status"><option value="DRAFT">Save Draft</option><option value="SUBMITTED">Submit for Review</option><option value="PUBLISHED">Publish</option></Select>
          <Input name="fileUrl" placeholder="File URL or storage path" />
        </div>
        <Input name="externalUrl" placeholder="External video or reference link" />
        <Button disabled={pending} type="submit">{pending ? "Saving" : "Save Content"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function FolderPanel({ overview }: { overview: ContentStudioProps["overview"] }) {
  const [message, action, pending] = useActionState(createContentFolderAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Content Library</h2>
      <p className="mt-1 text-sm text-muted-foreground">Organize lessons by course, subject, chapter and topic.</p>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="name" placeholder="Folder name" />
        <Select name="courseId"><option value="">Course</option>{overview.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
        <Select name="subjectId"><option value="">Subject</option>{overview.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        <Select name="chapterId"><option value="">Chapter</option>{overview.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</Select>
        <Select name="topicId"><option value="">Topic</option>{overview.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</Select>
        <Button disabled={pending} type="submit">{pending ? "Creating" : "Create Folder"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
      <div className="mt-6 space-y-3">
        {overview.folders.slice(0, 6).map((folder) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={folder.id}>{folder.name} - {folder._count.items} items</p>)}
      </div>
    </Card>
  );
}

function Library({ items, readOnly }: { items: ContentStudioProps["overview"]["items"]; readOnly: boolean }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Library</h2>
      <div className="mt-6 space-y-4">
        {items.length ? items.slice(0, 12).map((item) => <ContentRow item={item} key={item.id} readOnly={readOnly} />) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-sm text-muted-foreground">No content yet.</p>}
      </div>
    </Card>
  );
}

function ContentRow({ item, readOnly }: { item: ContentStudioProps["overview"]["items"][number]; readOnly: boolean }) {
  const [submitMessage, submitAction, submitPending] = useActionState(submitContentReviewAction, undefined);
  const [publishMessage, publishAction, publishPending] = useActionState(publishContentAction, undefined);
  const [archiveMessage, archiveAction, archivePending] = useActionState(archiveContentAction, undefined);
  const [duplicateMessage, duplicateAction, duplicatePending] = useActionState(duplicateContentAction, undefined);
  const message = submitMessage ?? publishMessage ?? archiveMessage ?? duplicateMessage;

  return (
    <div className="rounded-lg bg-muted p-4">
      <p className="text-sm text-muted-foreground">{sentenceCase(item.type)} - {sentenceCase(item.status)} - v{item.version}</p>
      <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{item.course.name} {item.subject ? `- ${item.subject.name}` : ""} {item.topic ? `- ${item.topic.name}` : ""}</p>
      <p className="mt-2 text-sm text-muted-foreground">Views {item.analytics?.views ?? 0} - Downloads {item.analytics?.downloads ?? 0} - Completion {item.analytics?.completionRate ?? 0}%</p>
      {!readOnly ? (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <TinyForm action={submitAction} disabled={submitPending} itemId={item.id} label="Submit" />
          <TinyForm action={publishAction} disabled={publishPending} itemId={item.id} label="Publish" />
          <TinyForm action={duplicateAction} disabled={duplicatePending} itemId={item.id} label="Duplicate" />
          <TinyForm action={archiveAction} disabled={archivePending} itemId={item.id} label="Archive" />
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

function ReviewQueues({ queues, readOnly }: { queues: ContentStudioProps["queues"]; readOnly: boolean }) {
  const [reviewMessage, reviewAction, reviewPending] = useActionState(reviewContentAction, undefined);
  const [approvalMessage, approvalAction, approvalPending] = useActionState(approveContentAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Approval Queue</h2>
      <Queue title="Video Editor Review" items={queues.videoEditorQueue.map((item) => ({ id: item.id, label: `${item.title} - ${sentenceCase(item.status)}` }))} />
      <Queue title="Academic Head Approval" items={queues.academicHeadQueue.map((item) => ({ id: item.id, label: `${item.title} - ${item.course.name}` }))} />
      {!readOnly ? (
        <div className="mt-6 grid gap-4">
          <form action={reviewAction} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Select name="itemId"><option value="">Review item</option>{queues.videoEditorQueue.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>
            <Select name="decision"><option value="APPROVED">Approve Review</option><option value="NEEDS_CHANGES">Needs Changes</option><option value="RETURNED">Return</option><option value="REJECTED">Reject</option></Select>
            <Input name="notes" placeholder="Review notes" />
            <Button disabled={reviewPending} type="submit" variant="secondary">Save</Button>
          </form>
          <form action={approvalAction} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Select name="itemId"><option value="">Approval item</option>{queues.academicHeadQueue.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>
            <Select name="decision"><option value="APPROVED">Approve</option><option value="NEEDS_CHANGES">Needs Changes</option><option value="RETURNED">Return</option><option value="REJECTED">Reject</option></Select>
            <Input name="notes" placeholder="Approval notes" />
            <Button disabled={approvalPending} type="submit" variant="secondary">Save</Button>
          </form>
          {reviewMessage || approvalMessage ? <p className="text-sm text-muted-foreground">{reviewMessage ?? approvalMessage}</p> : null}
        </div>
      ) : null}
      <Queue title="Recently Published" items={queues.recentlyPublished.map((item) => ({ id: item.id, label: `${item.title} - ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-IN") : "Published"}` }))} />
    </Card>
  );
}

function AnalyticsPanel({ analytics }: { analytics: ContentStudioProps["analytics"] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Content Analytics</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Mini label="Views" value={analytics.totals.views.toString()} />
        <Mini label="Downloads" value={analytics.totals.downloads.toString()} />
        <Mini label="Watch Time" value={`${Math.round(analytics.totals.watchTimeSeconds / 60)} min`} />
        <Mini label="Bookmarks" value={analytics.totals.bookmarks.toString()} />
      </div>
      <Queue title="Most Viewed" items={analytics.mostViewed.map((row) => ({ id: row.id, label: `${row.item.title} - ${row.views} views` }))} />
      <Queue title="Least Viewed" items={analytics.leastViewed.map((row) => ({ id: row.id, label: `${row.item.title} - ${row.views} views` }))} />
    </Card>
  );
}

function StoragePanel({ storage }: { storage: ContentStudioProps["storage"] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Storage Dashboard</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Mini label="Total Files" value={storage.totalFiles.toString()} />
        <Mini label="Used" value={formatBytes(storage.usedBytes)} />
        <Mini label="Remaining" value={formatBytes(storage.remainingBytes)} />
      </div>
      <Queue title="Large Files" items={storage.largeFiles.map((item) => ({ id: item.id, label: `${item.title} - ${formatBytes(item.sizeBytes)}` }))} />
      <Queue title="Unused Files" items={storage.unusedFiles.map((item) => ({ id: item.id, label: item.title }))} />
    </Card>
  );
}

function Queue({ title, items }: { title: string; items: { id: string; label: string }[] }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 space-y-3">
        {items.length ? items.slice(0, 6).map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={item.id}>{item.label}</p>) : <p className="rounded-lg bg-muted px-4 py-5 text-sm text-muted-foreground">Nothing pending.</p>}
      </div>
    </div>
  );
}

function TinyForm({ action, disabled, itemId, label }: { action: (payload: FormData) => void; disabled: boolean; itemId: string; label: string }) {
  return <form action={action}><input name="itemId" type="hidden" value={itemId} /><Button className="w-full" disabled={disabled} type="submit" variant="secondary">{label}</Button></form>;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <Card className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></Card>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}
