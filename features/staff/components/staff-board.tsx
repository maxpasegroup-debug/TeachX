"use client";

import { useActionState } from "react";
import type { User } from "@prisma/client";

import { applyLeaveAction, createPayrollAction, createStaffProfileAction } from "@/features/staff/actions";
import type { getLeaveOverview } from "@/services/leave-service";
import type { getPayrollOverview } from "@/services/payroll-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";

type StaffBoardProps = {
  staffUsers: User[];
  payroll: Awaited<ReturnType<typeof getPayrollOverview>>;
  leave: Awaited<ReturnType<typeof getLeaveOverview>>;
};

export function StaffBoard({ staffUsers, payroll, leave }: StaffBoardProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Kpi label="Staff" value={staffUsers.length.toString()} />
        <Kpi label="Leave Requests" value={leave.applications.length.toString()} />
        <Kpi label="Payroll Drafts" value={payroll.payrolls.length.toString()} />
        <Kpi label="Salary Profiles" value={payroll.salaries.length.toString()} />
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        <StaffProfileForm staffUsers={staffUsers} />
        <LeaveForm />
        <PayrollForm />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {staffUsers.slice(0, 8).map((user) => (
          <Card className="p-5" key={user.id}>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <h3 className="mt-2 text-xl font-semibold">{user.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Directory profile, documents and salary structure ready.</p>
          </Card>
        ))}
        {leave.applications.slice(0, 6).map((application) => (
          <Card className="p-5" key={application.id}>
            <p className="text-sm text-muted-foreground">{sentenceCase(application.status)}</p>
            <h3 className="mt-2 text-xl font-semibold">{application.applicant.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{new Date(application.fromDate).toLocaleDateString("en-IN")} to {new Date(application.toDate).toLocaleDateString("en-IN")}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

function StaffProfileForm({ staffUsers }: { staffUsers: User[] }) {
  const [message, action, pending] = useActionState(createStaffProfileAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Staff Directory</h2>
      <form action={action} className="mt-6 grid gap-4">
        <Select name="userId"><option value="">Staff user</option>{staffUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select>
        <Input name="department" placeholder="Department" />
        <Input name="designation" placeholder="Designation" />
        <Input name="joiningDate" type="date" />
        <Button disabled={pending} type="submit">{pending ? "Saving" : "Save Staff Profile"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function LeaveForm() {
  const [message, action, pending] = useActionState(applyLeaveAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Leave</h2>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="fromDate" type="date" />
        <Input name="toDate" type="date" />
        <Textarea name="reason" placeholder="Reason" />
        <Button disabled={pending} type="submit">{pending ? "Submitting" : "Apply Leave"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function PayrollForm() {
  const [message, action, pending] = useActionState(createPayrollAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Payroll</h2>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="name" placeholder="Payroll name" />
        <div className="grid gap-4 md:grid-cols-2"><Input name="month" placeholder="Month" /><Input name="year" placeholder="Year" /></div>
        <Button disabled={pending} type="submit">{pending ? "Creating" : "Create Payroll Draft"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <Card className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></Card>;
}
