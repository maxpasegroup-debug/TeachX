import { prisma } from "@/lib/db";
import { getRuntimeCheck } from "@/lib/env";
import { getPaymentConfig } from "@/lib/payments/config";
import { getEmailConfig } from "@/lib/email/config";
import { getStorageConfig } from "@/lib/storage/config";
import { getResilienceConfig } from "@/lib/resilience/config";
import { getGlobalizationConfig } from "@/lib/globalization/config";
import { getPerformanceConfig } from "@/lib/performance/config";
import { getOperationsConfig } from "@/lib/operations/config";
import { getPrivacyConfig } from "@/lib/privacy/config";
import { getPublicOperations } from "@/services/operations-service";
import packageJson from "@/package.json";
import releaseManifest from "@/release/manifest.json";

export type PublicComponentStatus = "operational" | "degraded" | "outage";

type PublicComponent = {
  name: string;
  status: PublicComponentStatus;
  message: string;
};

async function checkDatabase(): Promise<PublicComponent> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Database check timed out")), 4000))
    ]);
    return { name: "Teacher workspace", status: "operational", message: "Accounts and saved work are available." };
  } catch {
    return { name: "Teacher workspace", status: "outage", message: "Accounts or saved work may be temporarily unavailable." };
  }
}

export async function getPublicSystemStatus() {
  const runtime = getRuntimeCheck();
  const payments = getPaymentConfig();
  const email = getEmailConfig();
  const storage = getStorageConfig();
  const resilience = getResilienceConfig();
  const globalization = getGlobalizationConfig();
  const performanceConfig = getPerformanceConfig();
  const operationsConfig = getOperationsConfig();
  const privacyConfig = getPrivacyConfig();
  const [workspace, operations] = await Promise.all([checkDatabase(), getPublicOperations()]);
  const activeIncidents = operations.incidents.filter((incident) => incident.status !== "RESOLVED");

  const components: PublicComponent[] = [
    { name: "TeachX website", status: "operational", message: "Public pages are responding." },
    workspace,
    runtime.optional.openAI
      ? { name: "AI creation", status: "operational", message: "AI-assisted teaching tools are configured." }
      : { name: "AI creation", status: "degraded", message: "AI-assisted creation may be limited." },
    payments.live
      ? { name: "Billing", status: "operational", message: "Verified payment processing is configured." }
      : { name: "Billing", status: "degraded", message: "Paid checkout remains limited while payment verification is configured." },
    email.live
      ? { name: "Account email", status: "operational", message: "Account recovery and transactional delivery are configured." }
      : { name: "Account email", status: "degraded", message: "Account email delivery is not fully configured." },
    storage.live
      ? { name: "File storage", status: "operational", message: "Private file uploads and signed downloads are configured." }
      : { name: "File storage", status: "degraded", message: "File uploads are limited while private storage verification is incomplete." },
    resilience.live
      ? { name: "Low-connectivity mode", status: "operational", message: "Offline drafts and resumable large-file transfer are verified." }
      : { name: "Low-connectivity mode", status: "degraded", message: "Core service is available, but real-device resilience verification is incomplete." },
    globalization.live
      ? { name: "Global access", status: "operational", message: "Locale, RTL, and accessibility production evidence is current." }
      : { name: "Global access", status: "degraded", message: "Core service is available, but global accessibility verification is incomplete." },
    performanceConfig.live
      ? { name: "Global capacity", status: "operational", message: "Production latency, load, cache, and database capacity evidence is current." }
      : { name: "Global capacity", status: "degraded", message: "Core service is available, but deployed capacity verification is incomplete." },
    operationsConfig.live
      ? { name: "Incident response", status: "operational", message: "On-call, alert, status, and rollback drills are current." }
      : { name: "Incident response", status: "degraded", message: "Core service is available, but production operations evidence is incomplete." },
    privacyConfig.live
      ? { name: "Privacy operations", status: "operational", message: "Rights requests, retention, vendor, transfer, and cookie reviews are current." }
      : { name: "Privacy operations", status: "degraded", message: "Core service is available, but production privacy evidence is incomplete." },
    workspace.status === "outage"
      ? { name: "Teacher support", status: "outage", message: "Support intake may be temporarily unavailable." }
      : { name: "Teacher support", status: "operational", message: "Support requests can be submitted from the teacher workspace." }
  ];

  for (const incident of activeIncidents) {
    const level: PublicComponentStatus = incident.severity === "SEV1" ? "outage" : "degraded";
    for (const componentName of incident.affectedComponents) {
      const component = components.find((item) => item.name === componentName || (componentName === "Website" && item.name === "TeachX website"));
      if (component) {
        component.status = level;
        component.message = `An incident is ${incident.status.toLowerCase()}. See the public update below.`;
      }
    }
  }

  const overall: PublicComponentStatus = components.some((component) => component.status === "outage")
    ? "outage"
    : components.some((component) => component.status === "degraded") || !runtime.ok
      ? "degraded"
      : "operational";

  return {
    overall,
    summary: overall === "operational"
      ? "All monitored TeachX services are operational."
      : overall === "degraded"
        ? "TeachX is available, but one or more services are limited."
        : "TeachX is experiencing a service interruption.",
    checkedAt: new Date().toISOString(),
    version: packageJson.version,
    releaseChannel: releaseManifest.channel,
    components,
    incidents: operations.incidents,
    maintenance: operations.maintenance,
    emergencyWriteFreeze: operationsConfig.emergencyWriteFreeze
  };
}
