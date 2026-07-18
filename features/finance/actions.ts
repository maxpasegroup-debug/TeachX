"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { assignStudentFee, createFeeHead, createFeePlan } from "@/services/fee-service";
import { createExpense } from "@/services/expense-service";
import { createInvoice } from "@/services/invoice-service";
import { receivePayment } from "@/services/payment-service";
import { createReceipt } from "@/services/receipt-service";

function text(value: FormDataEntryValue | null) {
  const data = value?.toString().trim();
  return data || undefined;
}

async function getFinanceSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "finance.manage")) throw new Error("You do not have finance access.");
  return { session, institutionId };
}

const feeHeadSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["ADMISSION", "COURSE", "REGISTRATION", "EXAM", "MATERIAL", "HOSTEL", "TRANSPORT", "CUSTOM"]),
  description: z.string().optional()
});

export async function createFeeHeadAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getFinanceSession();
  const parsed = feeHeadSchema.safeParse({ name: text(formData.get("name")), type: text(formData.get("type")), description: text(formData.get("description")) });
  if (!parsed.success) return "Enter a fee head name and type.";

  const feeHead = await createFeeHead({ institutionId, ...parsed.data });
  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "FeeHead", entityId: feeHead.id, message: `Created fee head ${feeHead.name}` });
  revalidatePath("/finance");
  return "Fee head created.";
}

export async function createFeePlanAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getFinanceSession();
  const name = text(formData.get("name"));
  const totalAmount = text(formData.get("totalAmount"));
  if (!name || !totalAmount) return "Enter plan name and amount.";

  await createFeePlan({
    institutionId,
    name,
    totalAmount,
    courseId: text(formData.get("courseId")),
    batchId: text(formData.get("batchId")),
    subjectId: text(formData.get("subjectId")),
    discount: text(formData.get("discount")),
    scholarship: text(formData.get("scholarship"))
  });
  revalidatePath("/finance");
  return "Fee plan created.";
}

export async function assignStudentFeeAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getFinanceSession();
  const studentId = text(formData.get("studentId"));
  const amount = text(formData.get("amount"));
  if (!studentId || !amount) return "Select student and amount.";

  await assignStudentFee({
    institutionId,
    studentId,
    amount,
    courseId: text(formData.get("courseId")),
    batchId: text(formData.get("batchId")),
    subjectId: text(formData.get("subjectId")),
    feePlanId: text(formData.get("feePlanId")),
    feeHeadId: text(formData.get("feeHeadId")),
    dueDate: text(formData.get("dueDate")) ? new Date(text(formData.get("dueDate")) as string) : undefined
  });
  revalidatePath("/finance");
  return "Student fee assigned.";
}

export async function receivePaymentAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getFinanceSession();
  const studentId = text(formData.get("studentId"));
  const amount = text(formData.get("amount"));
  if (!studentId || !amount) return "Select student and amount.";

  const payment = await receivePayment({
    institutionId,
    studentId,
    amount,
    studentFeeId: text(formData.get("studentFeeId")),
    methodId: text(formData.get("methodId")),
    reference: text(formData.get("reference"))
  });
  await createReceipt({ institutionId, paymentId: payment.id });
  if (text(formData.get("studentFeeId"))) {
    await prisma.studentFee.update({ where: { id: text(formData.get("studentFeeId")) as string }, data: { status: "PARTIAL" } });
  }
  revalidatePath("/finance");
  return "Payment received and receipt generated.";
}

export async function createInvoiceAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getFinanceSession();
  const studentId = text(formData.get("studentId"));
  const total = text(formData.get("total"));
  if (!studentId || !total) return "Select student and amount.";

  await createInvoice({
    institutionId,
    studentId,
    total,
    studentFeeId: text(formData.get("studentFeeId")),
    description: text(formData.get("description")),
    dueDate: text(formData.get("dueDate")) ? new Date(text(formData.get("dueDate")) as string) : undefined
  });
  revalidatePath("/finance");
  return "Invoice created.";
}

export async function createExpenseAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getFinanceSession();
  const title = text(formData.get("title"));
  const amount = text(formData.get("amount"));
  if (!title || !amount) return "Enter expense and amount.";

  await createExpense({ institutionId, title, amount, categoryId: text(formData.get("categoryId")), remarks: text(formData.get("remarks")) });
  revalidatePath("/finance");
  return "Expense recorded.";
}
