import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPlannerData } from "@/services/planner-service";
import { sentenceCase } from "@/lib/format";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "whatsapp";
  const planner = await getPlannerData(session.user.institutionId);

  const lines = planner.entries.map((entry) => {
    return `${sentenceCase(entry.day)} | ${entry.timeSlot.name} | ${entry.batch.name} | ${entry.subject?.name ?? "Subject"} | ${entry.faculty?.name ?? "Faculty"} | ${entry.room?.name ?? "Room"}`;
  });

  if (format === "whatsapp") {
    return new NextResponse(lines.join("\n"), {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }

  return NextResponse.json({
    format,
    status: "ready",
    message: "Planner export endpoint prepared. PDF and image rendering can plug into this route in the export phase.",
    rows: lines
  });
}
