import { PageHeader } from "@/components/page-header";
import { AIHelperPanel } from "@/features/ai/components/ai-helper-panel";
import { GlobalCommandBar } from "@/features/workspace/components/global-command-bar";
import { WorkspaceKpiCard, WorkspaceListWidget, WorkspaceQuickActions, WorkspaceTimeline } from "@/features/workspace/components/dashboard-widgets";
import type { WorkspaceData } from "@/services/workspace-service";

export function RoleWorkspace({ workspace, name }: { workspace: WorkspaceData; name?: string | null }) {
  return (
    <>
      <PageHeader eyebrow={workspace.key.replaceAll("_", " ")} title={workspace.title} description={`${name ? `Good day, ${name.split(" ")[0]}. ` : ""}${workspace.subtitle}`} />
      <div className="space-y-8">
        <GlobalCommandBar />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workspace.kpis.map((kpi) => <WorkspaceKpiCard href={kpi.href} key={kpi.label} label={kpi.label} value={kpi.value} />)}
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6">
            {workspace.primary.map((widget) => <WorkspaceListWidget href={widget.href} items={widget.items} key={widget.title} title={widget.title} />)}
          </div>
          <div className="grid gap-6 content-start">
            <WorkspaceQuickActions actions={workspace.quickActions} />
            <AIHelperPanel scope={aiScopeForWorkspace(workspace.key)} />
            <WorkspaceListWidget items={workspace.notifications.map((item) => item.title)} title="Notifications" />
          </div>
        </section>
        <WorkspaceTimeline items={workspace.activity} />
      </div>
    </>
  );
}

function aiScopeForWorkspace(key: WorkspaceData["key"]) {
  if (key === "TEACHER" || key === "ACADEMIC_HEAD") return "TEACHER";
  if (key === "STUDENT" || key === "PARENT") return "STUDENT";
  if (key === "BUSINESS_DEVELOPMENT") return "ADMISSIONS";
  if (key === "DIRECTOR" || key === "ADMIN") return "DIRECTOR";
  if (key === "ACCOUNTS") return "FINANCE";
  return "SYSTEM";
}
