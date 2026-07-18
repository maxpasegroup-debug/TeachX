import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function SectionPage({ eyebrow, title, description, icon: Icon }: SectionPageProps) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <EmptyState icon={<Icon className="h-5 w-5" />} title={`${title} is ready for Phase 2`} description="The route, layout, navigation, and protected workspace surface are in place. Product-specific workflows can now be added without reviving ERP navigation." />
    </div>
  );
}
