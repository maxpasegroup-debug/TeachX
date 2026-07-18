import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createInvoice, getInvoicesForInstitution } from "@/services/invoice-service";

export async function GET() {
  const access = await requireApiSession("finance.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json({ invoices: await getInvoicesForInstitution(session.user.institutionId) });
}

export async function POST(request: Request) {
  const access = await requireApiSession("finance.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const invoice = await createInvoice({
    institutionId: session.user.institutionId,
    studentId: body.studentId,
    total: String(body.total ?? 0),
    studentFeeId: body.studentFeeId,
    description: body.description,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined
  });
  return NextResponse.json({ invoice }, { status: 201 });
}
