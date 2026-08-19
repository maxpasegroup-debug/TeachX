const integer = (value: string | undefined, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};

const decimal = (value: string | undefined, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};

const evidenceAgeDays = (value: string | undefined) => {
  if (!value) return null;
  const age = (Date.now() - new Date(value).getTime()) / 86_400_000;
  return Number.isFinite(age) && age >= 0 ? Math.round(age * 10) / 10 : null;
};

export function getOperationsConfig() {
  const budgets = {
    availabilityPercent: decimal(process.env.OPERATIONS_AVAILABILITY_TARGET, 99.9, 90, 100),
    p95LatencyMs: integer(process.env.OPERATIONS_P95_TARGET_MS, 1_500, 100, 10_000),
    sev1AckMinutes: integer(process.env.OPERATIONS_SEV1_ACK_MINUTES, 5, 1, 60),
    sev2AckMinutes: integer(process.env.OPERATIONS_SEV2_ACK_MINUTES, 15, 1, 240),
    evidenceMaxAgeDays: integer(process.env.OPERATIONS_EVIDENCE_MAX_AGE_DAYS, 30, 1, 90)
  };
  const ownership = {
    primaryOnCall: Boolean(process.env.OPERATIONS_PRIMARY_ONCALL?.trim()),
    secondaryOnCall: Boolean(process.env.OPERATIONS_SECONDARY_ONCALL?.trim()),
    incidentChannel: Boolean(process.env.OPERATIONS_INCIDENT_CHANNEL?.trim()),
    alertDestination: Boolean(process.env.OPERATIONS_ALERT_DESTINATION?.trim())
  };
  const controls = {
    onCall: process.env.OPERATIONS_ONCALL_READY === "true",
    alertRouting: process.env.OPERATIONS_ALERT_ROUTING_READY === "true",
    rollback: process.env.OPERATIONS_ROLLBACK_READY === "true",
    statusPage: process.env.OPERATIONS_STATUS_PAGE_READY === "true",
    incidentDrillRecord: Boolean(process.env.OPERATIONS_INCIDENT_DRILL_ID?.trim())
  };
  const evidence = {
    alertAgeDays: evidenceAgeDays(process.env.OPERATIONS_ALERT_TESTED_AT),
    rollbackAgeDays: evidenceAgeDays(process.env.OPERATIONS_ROLLBACK_TESTED_AT),
    incidentDrillAgeDays: evidenceAgeDays(process.env.OPERATIONS_INCIDENT_DRILL_TESTED_AT),
    statusPageAgeDays: evidenceAgeDays(process.env.OPERATIONS_STATUS_TESTED_AT)
  };
  const evidenceFresh = Object.values(evidence).every((age) => age !== null && age <= budgets.evidenceMaxAgeDays);
  return {
    budgets,
    ownership,
    controls,
    evidence,
    evidenceFresh,
    live: Object.values(ownership).every(Boolean) && Object.values(controls).every(Boolean) && evidenceFresh,
    emergencyWriteFreeze: process.env.OPERATIONS_WRITE_FREEZE === "true"
  };
}
