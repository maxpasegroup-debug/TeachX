import { NextResponse } from "next/server";

import { requireApiSession } from "@/lib/api-auth";
import { universalSearch } from "@/services/search-service";

const commands = [
  { label: "Open Dashboard", href: "/dashboard", action: "navigate" },
  { label: "Quick Student Search", href: "/people", action: "navigate" }
];

// Commands expose staff workflows and use the institution-wide search boundary.
export async function GET(request: Request) {
  const access = await requireApiSession("people.view");
  if ("response" in access) return access.response;
  const { session } = access;
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const localCommands = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  const searchResults = session.user.institutionId && query ? await universalSearch(session.user.institutionId, query, session.user.id, session.user.roles) : [];
  return NextResponse.json({ commands: localCommands, results: searchResults.slice(0, 8) });
}
