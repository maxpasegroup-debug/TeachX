import { headers } from "next/headers";
import { AudienceLanding, teacherLanding } from "@/components/landing/audience-landing";
import { LearnXLanding } from "@/components/landing/learnx-landing";
import { isLearnXHost } from "@/lib/host";

export default async function HomePage() {
  const host = (await headers()).get("host");
  return isLearnXHost(host) ? <LearnXLanding /> : <AudienceLanding config={teacherLanding} />;
}
