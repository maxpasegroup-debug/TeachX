const evidenceAgeDays = (value: string | undefined) => {
  if (!value) return null;
  const age = (Date.now() - new Date(value).getTime()) / 86_400_000;
  return Number.isFinite(age) && age >= 0 ? age : null;
};

export function getResilienceConfig() {
  const evidence = {
    lowBandwidthAgeDays: evidenceAgeDays(process.env.RESILIENCE_LOW_BANDWIDTH_TESTED_AT),
    pwaInstallAgeDays: evidenceAgeDays(process.env.RESILIENCE_PWA_INSTALL_TESTED_AT),
    resumableUploadAgeDays: evidenceAgeDays(process.env.RESILIENCE_RESUMABLE_UPLOAD_TESTED_AT)
  };
  const controls = {
    realDevice: process.env.RESILIENCE_REAL_DEVICE_READY === "true",
    offlineDraft: process.env.RESILIENCE_OFFLINE_DRAFT_READY === "true",
    resumableUpload: process.env.RESILIENCE_RESUMABLE_UPLOAD_READY === "true"
  };
  const evidenceFresh = Object.values(evidence).every((age) => age !== null && age <= 30);
  return { controls, evidence, evidenceFresh, live: Object.values(controls).every(Boolean) && evidenceFresh };
}
