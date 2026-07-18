import { UsersRound } from "lucide-react";

import { SectionPage } from "@/features/teachx/components/section-page";

export default function AdminTeachersPage() {
  return <SectionPage eyebrow="Platform Admin" title="Teachers" description="Review teacher accounts, profiles, marketplace readiness, and activity." icon={UsersRound} />;
}
