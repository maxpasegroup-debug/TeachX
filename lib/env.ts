const requiredProductionVariables = ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL"] as const;

export type RuntimeCheck = {
  ok: boolean;
  missing: string[];
  optional: {
    openAI: boolean;
    appTitle: boolean;
    appDescription: boolean;
    appUrl: boolean;
    razorpay: boolean;
    stripe: boolean;
    paymentsLive: boolean;
    email: boolean;
    whatsapp: boolean;
    storage: boolean;
  };
  launchMode: "ready" | "core_ready" | "configuration_incomplete";
};

export function getRuntimeCheck(): RuntimeCheck {
  const missing = process.env.NODE_ENV === "production" ? requiredProductionVariables.filter((key) => !process.env[key]) : [];

  return {
    ok: missing.length === 0,
    missing,
    optional: {
      openAI: Boolean(process.env.OPENAI_API_KEY),
      appTitle: Boolean(process.env.NEXT_PUBLIC_APP_TITLE),
      appDescription: Boolean(process.env.NEXT_PUBLIC_APP_DESCRIPTION),
      appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      paymentsLive: process.env.PAYMENTS_LIVE === "true",
      email: Boolean(process.env.EMAIL_PROVIDER),
      whatsapp: Boolean(process.env.WHATSAPP_PROVIDER),
      storage: Boolean(process.env.STORAGE_PROVIDER)
    },
    launchMode: missing.length ? "configuration_incomplete" : process.env.OPENAI_API_KEY ? "ready" : "core_ready"
  };
}

export function getPublicBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}
