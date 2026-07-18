"use client";

import { useActionState } from "react";
import type { Course } from "@prisma/client";

import { createCommissionAction, createPartnerAction } from "@/features/partners/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";
import type { PartnerWithDetails } from "@/services/partner-service";

export function PartnerBoard({ dashboard, courses }: { dashboard: { partners: PartnerWithDetails[]; studentsReferred: number; admissions: number; pendingCommission: number; paidCommission: number }; courses: Course[] }) {
  const [partnerMessage, partnerAction, partnerPending] = useActionState(createPartnerAction, undefined);
  const [commissionMessage, commissionAction, commissionPending] = useActionState(createCommissionAction, undefined);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Mini label="Partners" value={dashboard.partners.length.toString()} />
        <Mini label="Students Referred" value={dashboard.studentsReferred.toString()} />
        <Mini label="Admissions" value={dashboard.admissions.toString()} />
        <Mini label="Pending Commission" value={dashboard.pendingCommission.toString()} />
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Partner Registration</h2>
          <form action={partnerAction} className="mt-6 grid gap-4">
            <Input name="name" placeholder="Partner name" />
            <Input name="email" placeholder="Email" />
            <Input name="phone" placeholder="Phone" />
            <Input name="referralCode" placeholder="Referral code" />
            <Button disabled={partnerPending} type="submit">{partnerPending ? "Saving" : "Create Partner"}</Button>
            {partnerMessage ? <p className="text-sm text-muted-foreground">{partnerMessage}</p> : null}
          </form>
          <form action={commissionAction} className="mt-8 grid gap-4">
            <h3 className="font-semibold">Commission Rule</h3>
            <Select name="partnerId"><option value="">Partner</option>{dashboard.partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</Select>
            <Select name="courseId"><option value="">Course wise optional</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
            <Select name="type"><option value="FIXED">Fixed</option><option value="PERCENTAGE">Percentage</option><option value="COURSE_WISE">Course Wise</option><option value="CAMPAIGN_WISE">Campaign Wise</option><option value="MANUAL">Manual Override</option></Select>
            <Input name="amount" placeholder="Amount" />
            <Input name="percentage" placeholder="Percentage" />
            <Textarea name="remarks" placeholder="Approval workflow and settlement notes" />
            <Button disabled={commissionPending} type="submit" variant="secondary">Create Rule</Button>
            {commissionMessage ? <p className="text-sm text-muted-foreground">{commissionMessage}</p> : null}
          </form>
        </Card>
        <div className="space-y-4">
          {dashboard.partners.length ? dashboard.partners.map((partner) => (
            <Card className="p-6" key={partner.id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div><p className="text-sm text-muted-foreground">{partner.referralCode}</p><h3 className="mt-1 text-2xl font-semibold">{partner.name}</h3><p className="mt-2 text-sm text-muted-foreground">{partner.referralLink}</p></div>
                <span className="h-fit rounded-lg bg-muted px-3 py-2 text-sm font-medium">{sentenceCase(partner.status)}</span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-4">
                <p>{partner.referrals.length} referrals</p><p>{partner.commissions.filter((item) => item.status === "PENDING").length} pending commission</p><p>{partner.commissions.filter((item) => item.status === "PAID").length} paid commission</p><p>QR ready</p>
              </div>
            </Card>
          )) : <Card className="p-10 text-center text-muted-foreground">No partners yet.</Card>}
        </div>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <Card className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>;
}
