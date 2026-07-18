import { GraduationCap } from "lucide-react";

import { SectionPage } from "@/features/teachx/components/section-page";

export default function AdminStudentsPage() {
  return <SectionPage eyebrow="Platform Admin" title="Students" description="Review student accounts, learning access, and support readiness." icon={GraduationCap} />;
}
