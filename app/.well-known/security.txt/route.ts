import { getPublicBaseUrl } from "@/lib/env";

export function GET() {
  const baseUrl = getPublicBaseUrl();
  return new Response(
    [
      "Contact: mailto:support@teachx.guru",
      `Policy: ${baseUrl}/security`,
      `Preferred-Languages: en`,
      `Canonical: ${baseUrl}/.well-known/security.txt`
    ].join("\n"),
    {
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff"
      }
    }
  );
}
