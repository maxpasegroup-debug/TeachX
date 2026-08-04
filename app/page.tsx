import { headers } from "next/headers";
import { AudienceLanding, teacherLanding } from "@/components/landing/audience-landing";
import { LearnXLanding } from "@/components/landing/learnx-landing";

function isLearnXHost(host: string | null) {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  return hostname === "learnx.guru" || hostname === "www.learnx.guru";
}

export default async function HomePage() {
  const host = (await headers()).get("host");
  return isLearnXHost(host) ? <LearnXLanding /> : <AudienceLanding config={teacherLanding} />;
}