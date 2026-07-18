"use client";

import { useActionState } from "react";
import type { Batch, Campaign, CampaignSource, Course } from "@prisma/client";

import { createApplicationAction, createCampaignSourceAction, createAdmissionAction, createFollowUpAction, createLeadAction, createLeadTaskAction, updateLeadStageAction } from "@/features/admissions/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";
import type { LeadWithDetails } from "@/services/lead-service";

type AdmissionsCrmProps = {
  dashboard: {
    leads: LeadWithDetails[];
    todaysLeads: LeadWithDetails[];
    todaysFollowUps: unknown[];
    newApplications: unknown[];
    pendingAdmissions: unknown[];
    monthlyTarget: number;
    conversionRate: number;
  };
  courses: Course[];
  batches: Batch[];
  sources: CampaignSource[];
  campaigns: Campaign[];
};

const stages = ["NEW_LEAD", "CONTACTED", "INTERESTED", "DEMO_SCHEDULED", "DEMO_ATTENDED", "APPLICATION_SUBMITTED", "DOCUMENT_VERIFICATION", "ADMISSION_APPROVED", "FEE_PENDING", "ENROLLED", "STUDENT_CREATED"];

export function AdmissionsCrm({ dashboard, courses, batches, sources, campaigns }: AdmissionsCrmProps) {
  const [leadMessage, leadAction, leadPending] = useActionState(createLeadAction, undefined);
  const [sourceMessage, sourceAction, sourcePending] = useActionState(createCampaignSourceAction, undefined);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Mini label="Today Leads" value={dashboard.todaysLeads.length.toString()} />
        <Mini label="Today Follow-ups" value={dashboard.todaysFollowUps.length.toString()} />
        <Mini label="New Applications" value={dashboard.newApplications.length.toString()} />
        <Mini label="Pending Admissions" value={dashboard.pendingAdmissions.length.toString()} />
        <Mini label="Monthly Target" value={dashboard.monthlyTarget.toString()} />
        <Mini label="Conversion" value={`${dashboard.conversionRate}%`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Create lead</h2>
          <p className="mt-1 text-sm text-muted-foreground">Every admission starts as a lead.</p>
          <form action={leadAction} className="mt-6 grid gap-4">
            <Input name="name" placeholder="Student name" />
            <div className="grid gap-4 md:grid-cols-2"><Input name="phone" placeholder="Phone" /><Input name="email" placeholder="Email" /></div>
            <div className="grid gap-4 md:grid-cols-2"><Input name="guardianName" placeholder="Guardian" /><Input name="guardianPhone" placeholder="Guardian phone" /></div>
            <Input name="education" placeholder="Education" />
            <Textarea name="address" placeholder="Address" />
            <div className="grid gap-4 md:grid-cols-2">
              <Select name="interestedCourseId"><option value="">Interested course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
              <Select name="preferredBatchId"><option value="">Preferred batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Select name="sourceId"><option value="">Lead source</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</Select>
              <Select name="campaignId"><option value="">Campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</Select>
              <Select name="priority"><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option><option value="LOW">Low</option></Select>
            </div>
            <Textarea name="remarks" placeholder="Remarks. Later: lead summary, risk and suggested follow-up." />
            <Button disabled={leadPending} type="submit">{leadPending ? "Saving" : "Create Lead"}</Button>
            {leadMessage ? <p className="text-sm text-muted-foreground">{leadMessage}</p> : null}
          </form>
        </Card>

        <div className="space-y-4">
          {dashboard.leads.length ? dashboard.leads.map((lead) => <LeadCard batches={batches} courses={courses} key={lead.id} lead={lead} />) : <Card className="p-10 text-center text-muted-foreground">No leads yet.</Card>}
        </div>
      </section>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Lead sources</h2>
        <form action={sourceAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <Input name="name" placeholder="WhatsApp" />
          <Input name="code" placeholder="WHATSAPP" />
          <Button disabled={sourcePending} type="submit">Add Source</Button>
        </form>
        {sourceMessage ? <p className="mt-3 text-sm text-muted-foreground">{sourceMessage}</p> : null}
      </Card>
    </div>
  );
}

function LeadCard({ lead, courses, batches }: { lead: LeadWithDetails; courses: Course[]; batches: Batch[] }) {
  const [stageMessage, stageAction, stagePending] = useActionState(updateLeadStageAction, undefined);
  const [followMessage, followAction, followPending] = useActionState(createFollowUpAction, undefined);
  const [taskMessage, taskAction, taskPending] = useActionState(createLeadTaskAction, undefined);
  const [applicationMessage, applicationAction, applicationPending] = useActionState(createApplicationAction, undefined);
  const [admissionMessage, admissionAction, admissionPending] = useActionState(createAdmissionAction, undefined);

  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{lead.source?.name ?? "Manual"} - {sentenceCase(lead.priority)}</p>
          <h3 className="mt-1 text-2xl font-semibold">{lead.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{lead.phone ?? "No phone"} - {lead.interestedCourse?.name ?? "No course selected"}</p>
        </div>
        <span className="h-fit rounded-lg bg-muted px-3 py-2 text-sm font-medium">{sentenceCase(lead.stage)}</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <form action={stageAction} className="grid gap-3">
          <input name="leadId" type="hidden" value={lead.id} />
          <Select name="stage" defaultValue={lead.stage}>{stages.map((stage) => <option key={stage} value={stage}>{sentenceCase(stage)}</option>)}</Select>
          <Button disabled={stagePending} type="submit" variant="secondary">Move Stage</Button>
        </form>
        <form action={followAction} className="grid gap-3">
          <input name="leadId" type="hidden" value={lead.id} />
          <Select name="type"><option value="CALL">Call</option><option value="MEETING">Meeting</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option></Select>
          <Input name="scheduledAt" type="datetime-local" />
          <Button disabled={followPending} type="submit" variant="secondary">Schedule Follow-up</Button>
        </form>
        <form action={taskAction} className="grid gap-3">
          <input name="leadId" type="hidden" value={lead.id} />
          <Input name="title" placeholder="Task" />
          <Input name="deadline" type="date" />
          <Button disabled={taskPending} type="submit" variant="secondary">Assign Task</Button>
        </form>
        <form action={applicationAction} className="grid gap-3">
          <input name="leadId" type="hidden" value={lead.id} />
          <Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
          <Select name="batchId"><option value="">Batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
          <Button disabled={applicationPending} type="submit" variant="secondary">Submit Application</Button>
        </form>
      </div>
      <form action={admissionAction} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input name="leadId" type="hidden" value={lead.id} />
        <Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
        <Select name="batchId"><option value="">Batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
        <Button disabled={admissionPending} type="submit">Approve Admission</Button>
      </form>
      <div className="mt-5 rounded-lg bg-muted p-4">
        <p className="font-medium">Activity Timeline</p>
        <div className="mt-3 space-y-2">{lead.activities.length ? lead.activities.map((activity) => <p className="text-sm text-muted-foreground" key={activity.id}>{activity.title}</p>) : <p className="text-sm text-muted-foreground">No activity yet.</p>}</div>
      </div>
      {[stageMessage, followMessage, taskMessage, applicationMessage, admissionMessage].filter(Boolean).map((message) => <p className="mt-3 text-sm text-muted-foreground" key={message}>{message}</p>)}
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>;
}
