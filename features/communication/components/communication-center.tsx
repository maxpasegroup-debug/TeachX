"use client";

import { useActionState } from "react";
import type { Batch, Course } from "@prisma/client";

import { createCommunicationAction } from "@/features/communication/actions";
import type { getCommunicationCenter } from "@/services/communication-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CommunicationCenterProps = {
  center: Awaited<ReturnType<typeof getCommunicationCenter>>;
  courses: Course[];
  batches: Batch[];
};

export function CommunicationCenter({ center, courses, batches }: CommunicationCenterProps) {
  const [message, action, pending] = useActionState(createCommunicationAction, undefined);
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold">Create Announcement</h2>
        <p className="mt-1 text-sm text-muted-foreground">One message engine for announcements, notifications, role, course, batch and individual messages.</p>
        <form action={action} className="mt-6 grid gap-4">
          <Input name="title" placeholder="Title" />
          <Textarea name="body" placeholder="Message" />
          <div className="grid gap-4 md:grid-cols-4">
            <Select name="kind"><option value="ANNOUNCEMENT">Announcement</option><option value="BROADCAST">Broadcast</option><option value="ROLE_MESSAGE">Role Message</option><option value="COURSE_MESSAGE">Course Message</option><option value="BATCH_MESSAGE">Batch Message</option></Select>
            <Select name="priority"><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option><option value="LOW">Low</option></Select>
            <Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
            <Select name="batchId"><option value="">Batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Input name="roleKey" placeholder="Role key" />
            <Input name="scheduledAt" type="datetime-local" />
            <Input name="expiresAt" type="datetime-local" />
            <Input name="attachmentUrl" placeholder="Attachment URL" />
          </div>
          <Button disabled={pending} type="submit">{pending ? "Saving" : "Prepare Message"}</Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </form>
      </Card>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Recent Communications" items={center.communications.map((item) => `${item.title} - ${item.status}`)} />
        <Panel title="Communication Logs" items={center.logs.map((item) => `${item.channel} - ${item.status} - ${item.communication?.title ?? "Message"}`)} />
      </section>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return <Card className="p-6"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{items.length ? items.slice(0, 8).map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={item}>{item}</p>) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-sm text-muted-foreground">No messages yet.</p>}</div></Card>;
}
