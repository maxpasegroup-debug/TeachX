"use client";

import { useActionState } from "react";

import { completeSetupAction } from "@/features/setup/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetupWizard() {
  const [message, action, pending] = useActionState(completeSetupAction, undefined);

  return (
    <form action={action} className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">First run setup</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Prepare your institution</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">This creates the first institution, academic year, branch, course, fee head, and administrator account.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <SetupStep number="1" title="Institution Details"><Field label="Institution Name" name="institutionName" /><Field label="Email" name="email" type="email" /><Field label="Phone" name="phone" /><Field label="Website" name="website" /></SetupStep>
        <SetupStep number="2" title="Academic Year"><Field label="Academic Year" name="academicYear" placeholder="2026-2027" /><Field label="Start Date" name="academicStartDate" type="date" /><Field label="End Date" name="academicEndDate" type="date" /></SetupStep>
        <SetupStep number="3" title="Branch"><Field label="Branch Name" name="branchName" placeholder="Main Campus" /><Field label="Branch Code" name="branchCode" placeholder="MAIN" /></SetupStep>
        <SetupStep number="4" title="Courses"><Field label="First Course" name="courseName" placeholder="Foundation Course" /><Field label="Course Code" name="courseCode" placeholder="FOUNDATION" /></SetupStep>
        <SetupStep number="5" title="Fee Heads"><Field label="First Fee Head" name="feeHeadName" placeholder="Course Fee" /></SetupStep>
        <SetupStep number="6" title="Administrator"><Field label="Admin Name" name="adminName" /><Field label="Admin Email" name="adminEmail" type="email" /><Field label="Admin Password" name="adminPassword" type="password" /></SetupStep>
      </section>
      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">Step 7. Complete</p>
          <p className="mt-1 text-sm text-muted-foreground">After this, sign in and continue setup from Settings.</p>
        </div>
        <Button disabled={pending} type="submit">{pending ? "Preparing" : "Complete setup"}</Button>
      </Card>
      {message ? <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}

function SetupStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <Card className="space-y-4 p-6"><p className="text-sm font-medium text-muted-foreground">Step {number}</p><h2 className="text-xl font-semibold">{title}</h2>{children}</Card>;
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} placeholder={placeholder} required type={type} /></div>;
}
