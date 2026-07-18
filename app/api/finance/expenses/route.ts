import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { createExpense, getExpenseOverview } from "@/services/expense-service";

export async function GET() {
  const access = await requireApiSession("finance.view");
  if ("response" in access) return access.response;
  const { session } = access;
  return NextResponse.json(await getExpenseOverview(session.user.institutionId));
}

export async function POST(request: Request) {
  const access = await requireApiSession("finance.manage");
  if ("response" in access) return access.response;
  const { session } = access;
  if (!session.user.institutionId) return NextResponse.json({ error: "Institution required" }, { status: 400 });
  const body = await request.json();
  const expense = await createExpense({ institutionId: session.user.institutionId, title: body.title, amount: String(body.amount ?? 0), categoryId: body.categoryId, remarks: body.remarks });
  return NextResponse.json({ expense }, { status: 201 });
}
