"use client";

import { useActionState } from "react";
import type { Batch, Course, Subject, User } from "@prisma/client";

import { assignStudentFeeAction, createExpenseAction, createFeeHeadAction, createFeePlanAction, createInvoiceAction, receivePaymentAction } from "@/features/finance/actions";
import type { getExpenseOverview } from "@/services/expense-service";
import type { getFeeOverview } from "@/services/fee-service";
import type { getInvoicesForInstitution } from "@/services/invoice-service";
import type { getPaymentOverview } from "@/services/payment-service";
import type { getReceiptsForInstitution } from "@/services/receipt-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sentenceCase } from "@/lib/format";

type FinanceBoardProps = {
  feeOverview: Awaited<ReturnType<typeof getFeeOverview>>;
  paymentOverview: Awaited<ReturnType<typeof getPaymentOverview>>;
  invoices: Awaited<ReturnType<typeof getInvoicesForInstitution>>;
  receipts: Awaited<ReturnType<typeof getReceiptsForInstitution>>;
  expenseOverview: Awaited<ReturnType<typeof getExpenseOverview>>;
  students: User[];
  courses: Course[];
  batches: Batch[];
  subjects: Subject[];
};

export function FinanceBoard({ feeOverview, paymentOverview, invoices, receipts, expenseOverview, students, courses, batches, subjects }: FinanceBoardProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Kpi label="Expected" value={money(feeOverview.totals.expected)} />
        <Kpi label="Collected" value={money(feeOverview.totals.collected)} />
        <Kpi label="Outstanding" value={money(feeOverview.totals.outstanding)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <FeeSetup courses={courses} batches={batches} subjects={subjects} />
        <Collection students={students} fees={feeOverview.studentFees} methods={paymentOverview.methods} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <InvoicePanel students={students} fees={feeOverview.studentFees} invoices={invoices} receipts={receipts} />
        <ExpensePanel categories={expenseOverview.categories} expenses={expenseOverview.expenses} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {feeOverview.studentFees.slice(0, 8).map((fee) => (
          <Card className="p-5" key={fee.id}>
            <p className="text-sm text-muted-foreground">{fee.feeHead?.name ?? "Student fee"} - {sentenceCase(fee.status)}</p>
            <h3 className="mt-2 text-xl font-semibold">{fee.student.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{fee.course?.name ?? "Course"} {fee.batch ? `- ${fee.batch.name}` : ""}</p>
            <p className="mt-4 text-2xl font-semibold">{money(Number(fee.amount))}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

function FeeSetup({ courses, batches, subjects }: { courses: Course[]; batches: Batch[]; subjects: Subject[] }) {
  const [headMessage, headAction, headPending] = useActionState(createFeeHeadAction, undefined);
  const [planMessage, planAction, planPending] = useActionState(createFeePlanAction, undefined);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Fee Engine</h2>
      <p className="mt-1 text-sm text-muted-foreground">Create heads and plans. Installments, scholarships, discounts and fine rules extend from here.</p>
      <form action={headAction} className="mt-6 grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <Input name="name" placeholder="Fee head name" />
        <Select name="type">
          <option value="COURSE">Course Fee</option>
          <option value="ADMISSION">Admission Fee</option>
          <option value="REGISTRATION">Registration Fee</option>
          <option value="EXAM">Exam Fee</option>
          <option value="MATERIAL">Material Fee</option>
          <option value="HOSTEL">Hostel Fee</option>
          <option value="TRANSPORT">Transport Fee</option>
          <option value="CUSTOM">Custom</option>
        </Select>
        <Button disabled={headPending} type="submit">{headPending ? "Saving" : "Create Head"}</Button>
        {headMessage ? <p className="self-center text-sm text-muted-foreground">{headMessage}</p> : null}
      </form>
      <form action={planAction} className="mt-8 grid gap-4">
        <Input name="name" placeholder="Fee plan name" />
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="courseId"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
          <Select name="batchId"><option value="">Batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select>
          <Select name="subjectId"><option value="">Subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input name="totalAmount" placeholder="Total amount" />
          <Input name="discount" placeholder="Discount" />
          <Input name="scholarship" placeholder="Scholarship" />
        </div>
        <Button disabled={planPending} type="submit">{planPending ? "Saving" : "Create Fee Plan"}</Button>
        {planMessage ? <p className="text-sm text-muted-foreground">{planMessage}</p> : null}
      </form>
    </Card>
  );
}

function Collection({ students, fees, methods }: { students: User[]; fees: FinanceBoardProps["feeOverview"]["studentFees"]; methods: FinanceBoardProps["paymentOverview"]["methods"] }) {
  const [assignMessage, assignAction, assignPending] = useActionState(assignStudentFeeAction, undefined);
  const [paymentMessage, paymentAction, paymentPending] = useActionState(receivePaymentAction, undefined);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Fee Collection</h2>
      <p className="mt-1 text-sm text-muted-foreground">Search-ready collection flow with partial payments, receipts and gateway placeholders.</p>
      <form action={assignAction} className="mt-6 grid gap-4">
        <Select name="studentId"><option value="">Student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</Select>
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="feeHeadId"><option value="">Fee head</option>{fees.map((fee) => fee.feeHead ? <option key={fee.feeHead.id} value={fee.feeHead.id}>{fee.feeHead.name}</option> : null)}</Select>
          <Input name="amount" placeholder="Amount" />
          <Input name="dueDate" type="date" />
        </div>
        <Button disabled={assignPending} type="submit">{assignPending ? "Assigning" : "Assign Fee"}</Button>
        {assignMessage ? <p className="text-sm text-muted-foreground">{assignMessage}</p> : null}
      </form>
      <form action={paymentAction} className="mt-8 grid gap-4">
        <Select name="studentId"><option value="">Student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</Select>
        <Select name="studentFeeId"><option value="">Pending fee</option>{fees.map((fee) => <option key={fee.id} value={fee.id}>{fee.student.name} - {money(Number(fee.amount))}</option>)}</Select>
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="methodId"><option value="">Payment method</option>{methods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}</Select>
          <Input name="amount" placeholder="Amount received" />
          <Input name="reference" placeholder="Reference" />
        </div>
        <Button disabled={paymentPending} type="submit">{paymentPending ? "Receiving" : "Receive Payment"}</Button>
        {paymentMessage ? <p className="text-sm text-muted-foreground">{paymentMessage}</p> : null}
      </form>
    </Card>
  );
}

function InvoicePanel({ students, fees, invoices, receipts }: { students: User[]; fees: FinanceBoardProps["feeOverview"]["studentFees"]; invoices: FinanceBoardProps["invoices"]; receipts: FinanceBoardProps["receipts"] }) {
  const [message, action, pending] = useActionState(createInvoiceAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Invoices and Receipts</h2>
      <form action={action} className="mt-6 grid gap-4">
        <Select name="studentId"><option value="">Student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</Select>
        <Select name="studentFeeId"><option value="">Fee item</option>{fees.map((fee) => <option key={fee.id} value={fee.id}>{fee.student.name} - {fee.feeHead?.name ?? "Fee"}</option>)}</Select>
        <div className="grid gap-4 md:grid-cols-2"><Input name="total" placeholder="Invoice amount" /><Input name="dueDate" type="date" /></div>
        <Input name="description" placeholder="Description" />
        <Button disabled={pending} type="submit">{pending ? "Creating" : "Generate Invoice"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
      <div className="mt-8 grid gap-3">
        <p className="text-sm font-medium">Recent documents</p>
        {[...invoices.slice(0, 3).map((invoice) => `${invoice.invoiceNumber} - ${sentenceCase(invoice.status)} - ${money(Number(invoice.total))}`), ...receipts.slice(0, 3).map((receipt) => `${receipt.receiptNumber} - Receipt`)].map((item) => (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground" key={item}>{item}</p>
        ))}
      </div>
    </Card>
  );
}

function ExpensePanel({ categories, expenses }: { categories: FinanceBoardProps["expenseOverview"]["categories"]; expenses: FinanceBoardProps["expenseOverview"]["expenses"] }) {
  const [message, action, pending] = useActionState(createExpenseAction, undefined);
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Expenses</h2>
      <form action={action} className="mt-6 grid gap-4">
        <Input name="title" placeholder="Expense title" />
        <div className="grid gap-4 md:grid-cols-2">
          <Select name="categoryId"><option value="">Category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select>
          <Input name="amount" placeholder="Amount" />
        </div>
        <Textarea name="remarks" placeholder="Remarks or attachment note" />
        <Button disabled={pending} type="submit">{pending ? "Saving" : "Record Expense"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
      <div className="mt-8 grid gap-3">
        {expenses.slice(0, 5).map((expense) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={expense.id}>{expense.title} - {money(Number(expense.amount))} - {sentenceCase(expense.status)}</p>)}
      </div>
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <Card className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></Card>;
}

function money(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}
