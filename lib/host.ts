/** Identifies requests served from the student-facing LearnX domain. */
export function isLearnXHost(host: string | null) {
  const hostname = (host ?? "").split(":")[0].toLowerCase();

  return hostname === "learnx.guru" || hostname === "www.learnx.guru";
}

/** Creates a same-origin URL for redirects from multi-domain auth flows. */
export function getRequestOrigin(requestHeaders: Headers) {
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) return null;

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
