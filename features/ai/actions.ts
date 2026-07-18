"use server";

import { auth } from "@/auth";
import { runAI } from "@/services/ai-service";

function text(value: FormDataEntryValue | null) {
  const data = value?.toString().trim();
  return data || undefined;
}

export async function runAIHelperAction(_: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) return "Please sign in.";
  const scope = text(formData.get("scope")) ?? "SYSTEM";
  const feature = text(formData.get("feature")) ?? "general";
  const prompt = text(formData.get("prompt"));
  if (!prompt) return "Enter what you want help with.";

  const result = await runAI({
    institutionId: session.user.institutionId,
    userId: session.user.id,
    scope: scope as never,
    feature,
    prompt
  });

  return result.text;
}
