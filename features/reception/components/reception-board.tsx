"use client";

import { useActionState } from "react";

import { createAppointmentAction, createVisitorAction } from "@/features/reception/actions";
import type { getReceptionOverview } from "@/services/reception-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";

type ReceptionBoardProps = {
  overview: Awaited<ReturnType<typeof getReceptionOverview>>;
};

export function ReceptionBoard({ overview }: ReceptionBoardProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Kpi label="Visitors Today" value={overview.visitors.length.toString()} />
        <Kpi label="Appointments" value={overview.appointments.length.toString()} />
        <Kpi label="Waiting" value={overview.visitors.filter((visitor) => visitor.status === "WAITING").length.toString()} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <VisitorForm />
        <AppointmentForm />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {overview.visitors.slice(0, 6).map((visitor) => (
          <Card className="p-5" key={visitor.id}>
            <p className="text-sm text-muted-foreground">{sentenceCase(visitor.status)} - {visitor.phone ?? "No phone"}</p>
            <h3 className="mt-2 text-xl font-semibold">{visitor.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{visitor.purpose ?? "Walk-in enquiry"}</p>
          </Card>
        ))}
        {overview.appointments.slice(0, 6).map((appointment) => (
          <Card className="p-5" key={appointment.id}>
            <p className="text-sm text-muted-foreground">{new Date(appointment.scheduledAt).toLocaleString("en-IN")}</p>
            <h3 className="mt-2 text-xl font-semibold">{appointment.visitorName}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{appointment.purpose ?? "Appointment"}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

function VisitorForm() {
  const [message, action, pending] = useActionState(createVisitorAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Visitor Register</h2>
      <p className="mt-1 text-sm text-muted-foreground">Walk-ins, enquiries, document collection and receipt desk start here.</p>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="name" placeholder="Visitor name" />
        <Input name="phone" placeholder="Phone" />
        <Input name="purpose" placeholder="Purpose" />
        <Textarea name="remarks" placeholder="Remarks" />
        <Button disabled={pending} type="submit">{pending ? "Saving" : "Add Visitor"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function AppointmentForm() {
  const [message, action, pending] = useActionState(createAppointmentAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Appointment Register</h2>
      <p className="mt-1 text-sm text-muted-foreground">Schedule parent meetings, counselling visits and admission follow-ups.</p>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="visitorName" placeholder="Visitor name" />
        <Input name="phone" placeholder="Phone" />
        <Input name="scheduledAt" type="datetime-local" />
        <Input name="purpose" placeholder="Purpose" />
        <Button disabled={pending} type="submit">{pending ? "Scheduling" : "Schedule Appointment"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <Card className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></Card>;
}
