import { prisma } from "@/lib/db";
import { getRuntimeCheck } from "@/lib/env";
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
  const workspace = await checkDatabase();

  const components: PublicComponent[] = [
    { name: "TeachX website", status: "operational", message: "Public pages are responding." },
    workspace,
    runtime.optional.openAI
      ? { name: "AI creation", status: "operational", message: "AI-assisted teaching tools are configured." }
      : { name: "AI creation", status: "degraded", message: "AI-assisted creation may be limited." },
    runtime.optional.paymentsLive && (runtime.optional.razorpay || runtime.optional.stripe)
      ? { name: "Billing", status: "operational", message: "A payment provider is configured." }
      : { name: "Billing", status: "degraded", message: "Paid checkout remains limited while payment verification is configured." },
    workspace.status === "outage"
      ? { name: "Teacher support", status: "outage", message: "Support intake may be temporarily unavailable." }
      : { name: "Teacher support", status: "operational", message: "Support requests can be submitted from the teacher workspace." }
  ];

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
    components
  };
}
