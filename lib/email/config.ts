import "server-only";

export function getEmailConfig() {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase();
  const configured = provider === "resend"
    && Boolean(process.env.RESEND_API_KEY && process.env.RESEND_WEBHOOK_SECRET && process.env.EMAIL_FROM && process.env.EMAIL_REPLY_TO);
  const controls = process.env.EMAIL_DOMAIN_VERIFIED === "true"
    && process.env.EMAIL_DMARC_READY === "true"
    && process.env.EMAIL_TRANSACTIONAL_READY === "true";
  return {
    provider,
    configured,
    controls,
    live: process.env.EMAIL_LIVE === "true" && configured && controls,
    domainVerified: process.env.EMAIL_DOMAIN_VERIFIED === "true",
    dmarcReady: process.env.EMAIL_DMARC_READY === "true",
    transactionalReady: process.env.EMAIL_TRANSACTIONAL_READY === "true"
  };
}
