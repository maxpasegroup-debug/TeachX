const requiredProductionVariables = [
  "DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "REDIS_URL", "SETUP_SECRET", "SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN",
  "SMS_PROVIDER", "SMS_LIVE", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN",
  "BACKUP_PROVIDER", "BACKUP_S3_ENDPOINT", "BACKUP_S3_REGION", "BACKUP_S3_BUCKET", "BACKUP_S3_ACCESS_KEY_ID",
  "BACKUP_S3_SECRET_ACCESS_KEY", "BACKUP_S3_PREFIX", "BACKUP_PITR_ENABLED", "BACKUP_VOLUME_SCHEDULE",
  "BACKUP_RPO_HOURS", "BACKUP_RTO_MINUTES", "BACKUP_RETENTION_DAYS", "BACKUP_DRILL_MAX_AGE_DAYS",
  "BACKUP_MEDIA_VERSIONING_ENABLED", "BACKUP_MEDIA_RETENTION_DAYS",
  "PAYMENTS_LIVE", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "PAYMENT_TAX_READY", "PAYMENT_REFUNDS_READY", "PAYMENT_RECONCILIATION_READY",
  "PAYMENT_MERCHANT_LEGAL_NAME", "PAYMENT_MERCHANT_ADDRESS", "PAYMENT_PRICES_INCLUDE_TAX",
  "EMAIL_PROVIDER", "RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "EMAIL_FROM", "EMAIL_REPLY_TO", "EMAIL_LIVE",
  "EMAIL_DOMAIN_VERIFIED", "EMAIL_DMARC_READY", "EMAIL_TRANSACTIONAL_READY"
  , "STORAGE_PROVIDER", "STORAGE_S3_REGION", "STORAGE_S3_BUCKET", "STORAGE_S3_ACCESS_KEY_ID", "STORAGE_S3_SECRET_ACCESS_KEY",
  "STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY"
  , "STORAGE_MULTIPART_THRESHOLD_MB", "STORAGE_MULTIPART_PART_MB", "STORAGE_RESUMABLE_TTL_HOURS",
  "RESILIENCE_REAL_DEVICE_READY", "RESILIENCE_OFFLINE_DRAFT_READY", "RESILIENCE_RESUMABLE_UPLOAD_READY"
  , "NEXT_PUBLIC_DEFAULT_LOCALE", "NEXT_PUBLIC_DEFAULT_TIME_ZONE", "GLOBALIZATION_LOCALE_READY", "GLOBALIZATION_RTL_READY", "GLOBALIZATION_WCAG_READY"
  , "DATABASE_POOL_MAX", "DATABASE_POOL_TIMEOUT_SECONDS", "PERFORMANCE_DATABASE_TIMEOUT_MS", "PERFORMANCE_REQUEST_TIMEOUT_MS", "PERFORMANCE_P95_BUDGET_MS", "PERFORMANCE_MAX_ERROR_RATE_PERCENT", "PERFORMANCE_LOAD_CONCURRENCY", "PERFORMANCE_LOAD_REQUESTS", "PERFORMANCE_CAPACITY_READY", "PERFORMANCE_DATABASE_POOL_READY", "PERFORMANCE_LOAD_TEST_READY"
  , "PRIVACY_CONTACT_EMAIL", "PRIVACY_PROGRAM_READY", "PRIVACY_RETENTION_READY", "PRIVACY_VENDOR_REGISTER_READY", "PRIVACY_TRANSFER_REVIEW_READY"
] as const;

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
    sms: boolean;
    whatsapp: boolean;
    storage: boolean;
    observability: boolean;
    recovery: boolean;
  };
  launchMode: "ready" | "core_ready" | "configuration_incomplete";
};

export function getRuntimeCheck(): RuntimeCheck {
  const missing: string[] = process.env.NODE_ENV === "production" ? [...requiredProductionVariables.filter((key) => !process.env[key])] : [];
  if (process.env.NODE_ENV === "production" && !process.env.TWILIO_MESSAGING_SERVICE_SID && !process.env.TWILIO_FROM_NUMBER) missing.push("TWILIO_MESSAGING_SERVICE_SID_OR_FROM_NUMBER");

  return {
    ok: missing.length === 0,
    missing,
    optional: {
      openAI: Boolean(process.env.OPENAI_API_KEY),
      appTitle: Boolean(process.env.NEXT_PUBLIC_APP_TITLE),
      appDescription: Boolean(process.env.NEXT_PUBLIC_APP_DESCRIPTION),
      appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      paymentsLive: process.env.PAYMENTS_LIVE === "true",
      email: process.env.EMAIL_LIVE === "true" && process.env.EMAIL_PROVIDER === "resend" && Boolean(process.env.RESEND_API_KEY && process.env.RESEND_WEBHOOK_SECRET),
      sms: process.env.SMS_LIVE === "true" && process.env.SMS_PROVIDER === "twilio" && Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_FROM_NUMBER)),
      whatsapp: Boolean(process.env.WHATSAPP_PROVIDER),
      storage: process.env.STORAGE_PROVIDER === "s3" && Boolean(process.env.STORAGE_S3_BUCKET && process.env.STORAGE_S3_ACCESS_KEY_ID && process.env.STORAGE_S3_SECRET_ACCESS_KEY) && ["STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY"].every((key) => process.env[key] === "true"),
      observability: Boolean(process.env.SENTRY_DSN && process.env.NEXT_PUBLIC_SENTRY_DSN),
      recovery: Boolean(process.env.BACKUP_S3_BUCKET && process.env.BACKUP_PITR_ENABLED === "true")
    },
    launchMode: missing.length ? "configuration_incomplete" : process.env.OPENAI_API_KEY ? "ready" : "core_ready"
  };
}

export function getPublicBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}
