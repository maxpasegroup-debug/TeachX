"use server";

import { redirect } from "next/navigation";

import { completeFirstRunSetup } from "@/services/setup-service";

export async function completeSetupAction(_: string | undefined, formData: FormData) {
  try {
    await completeFirstRunSetup(Object.fromEntries(formData));
  } catch (error) {
    return error instanceof Error ? error.message : "Setup could not be completed.";
  }

  redirect("/login");
}
