import { requireApiSession } from "@/lib/api-auth";
import { buildPortableAccountSnapshot } from "@/services/privacy-service";

export async function GET() {
  const access = await requireApiSession("dashboard.view");
  if ("response" in access) return access.response;
  const snapshot = await buildPortableAccountSnapshot(access.session.user.id);
  return new Response(JSON.stringify(snapshot, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="teachx-account-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store" } });
}
