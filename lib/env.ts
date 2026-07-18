const requiredProductionVariables = ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL"] as const;

export type RuntimeCheck = {
  ok: boolean;
  missing: string[];
  optional: {
    openAI: boolean;
    appTitle: boolean;
    appDescription: boolean;
  };
};

export function getRuntimeCheck(): RuntimeCheck {
  const missing = process.env.NODE_ENV === "production" ? requiredProductionVariables.filter((key) => !process.env[key]) : [];

  return {
    ok: missing.length === 0,
    missing,
    optional: {
      openAI: Boolean(process.env.OPENAI_API_KEY),
      appTitle: Boolean(process.env.NEXT_PUBLIC_APP_TITLE),
      appDescription: Boolean(process.env.NEXT_PUBLIC_APP_DESCRIPTION)
    }
  };
}

export function getPublicBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}
