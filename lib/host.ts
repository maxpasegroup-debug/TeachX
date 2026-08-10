/** Identifies requests served from the student-facing LearnX domain. */
export function isLearnXHost(host: string | null) {
  const hostname = (host ?? "").split(":")[0].toLowerCase();

  return hostname === "learnx.guru" || hostname === "www.learnx.guru";
}
