import { Store } from "lucide-react";

import { SectionPage } from "@/features/teachx/components/section-page";

export default function AdminMarketplacePage() {
  return <SectionPage eyebrow="Platform Admin" title="Marketplace" description="Curate teacher offers, resources, quality checks, and publishing flow." icon={Store} />;
}
