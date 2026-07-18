import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { getPaymentOverview, receivePayment } from "@/services/payment-service";
import { createReceipt } from "@/services/receipt-service";

export async function GET() {
  const access = await requireApiSession("finance.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getPaymentOverview(session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("finance.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const payment = await receivePayment({
    institutionId: session.user.institutionId,
    studentId: body.studentId,
    amount: String(body.amount ?? 0),
    studentFeeId: body.studentFeeId,
    methodId: body.methodId,
    reference: body.reference
  });
  const receipt = await createReceipt({ institutionId: session.user.institutionId, paymentId: payment.id });
  return NextResponse.json({ payment, receipt }, { status: 201 });
}
