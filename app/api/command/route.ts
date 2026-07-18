import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { universalSearch } from "@/services/search-service";

const commands = [
  { label: "Open Dashboard", href: "/dashboard", action: "navigate" },
  { label: "Quick Student Search", href: "/people", action: "navigate" },
  { label: "Quick Batch Search", href: "/batches", action: "navigate" },
  { label: "Quick Exam Search", href: "/exams", action: "navigate" },
  { label: "Create Lead", href: "/admissions", action: "quick_create" },
  { label: "Receive Payment", href: "/finance", action: "quick_create" },
  { label: "Upload Lesson", href: "/content-studio", action: "quick_create" }
];

export async function GET(request: Request) {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const localCommands = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  const searchResults = session.user.institutionId && query ? await universalSearch(session.user.institutionId, query) : [];
  return NextResponse.json({ commands: localCommands, results: searchResults.slice(0, 8) });
}
