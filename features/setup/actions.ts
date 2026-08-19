"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getClientKey, rateLimit, secureSecretMatch } from "@/lib/security";
import { completeFirstRunSetup } from "@/services/setup-service";

export async function completeSetupAction(_: string | undefined, formData: FormData) {
  const h = await headers();
  const limited = await rateLimit(`setup:${getClientKey({ headers: h } as Request, "setup")}`, 5, 60_000);
  if (limited) return limited.status === 503 ? "Setup protection is not configured." : "Too many setup attempts. Please try again shortly.";
  if (!secureSecretMatch(formData.get("setupSecret"), process.env.SETUP_SECRET)) return "The one-time setup secret is invalid.";

  try {
    await completeFirstRunSetup(Object.fromEntries(formData));
  } catch (error) {
    return error instanceof Error ? error.message : "Setup could not be completed.";
  }

  redirect("/login");
}
