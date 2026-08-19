export const PRIVACY_POLICY_VERSION = "2026-08-19";

const integer = (value: string | undefined, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};

const ageDays = (value: string | undefined) => {
  if (!value) return null;
  const age = (Date.now() - new Date(value).getTime()) / 86_400_000;
  return Number.isFinite(age) && age >= 0 ? Math.round(age * 10) / 10 : null;
};

export function getPrivacyConfig() {
  const requestSlaDays = integer(process.env.PRIVACY_REQUEST_SLA_DAYS, 30, 1, 90);
  const evidenceMaxAgeDays = integer(process.env.PRIVACY_EVIDENCE_MAX_AGE_DAYS, 90, 1, 180);
  const controls = {
    program: process.env.PRIVACY_PROGRAM_READY === "true",
    retention: process.env.PRIVACY_RETENTION_READY === "true",
    vendorRegister: process.env.PRIVACY_VENDOR_REGISTER_READY === "true",
    transferReview: process.env.PRIVACY_TRANSFER_REVIEW_READY === "true",
    privacyContact: Boolean(process.env.PRIVACY_CONTACT_EMAIL?.trim())
  };
  const evidence = {
    rightsDrillAgeDays: ageDays(process.env.PRIVACY_RIGHTS_DRILL_TESTED_AT),
    retentionReviewAgeDays: ageDays(process.env.PRIVACY_RETENTION_REVIEWED_AT),
    vendorReviewAgeDays: ageDays(process.env.PRIVACY_VENDOR_REVIEWED_AT),
    cookieReviewAgeDays: ageDays(process.env.PRIVACY_COOKIE_REVIEWED_AT)
  };
  const evidenceFresh = Object.values(evidence).every((age) => age !== null && age <= evidenceMaxAgeDays);
  return { policyVersion: PRIVACY_POLICY_VERSION, requestSlaDays, evidenceMaxAgeDays, controls, evidence, evidenceFresh, live: Object.values(controls).every(Boolean) && evidenceFresh };
}
