const integer = (value: string | undefined, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};

const evidenceAgeDays = (value: string | undefined) => {
  if (!value) return null;
  const age = (Date.now() - new Date(value).getTime()) / 86_400_000;
  return Number.isFinite(age) && age >= 0 ? age : null;
};

export function getPerformanceConfig() {
  const budgets = {
    databaseTimeoutMs: integer(process.env.PERFORMANCE_DATABASE_TIMEOUT_MS, 3_000, 250, 15_000),
    requestTimeoutMs: integer(process.env.PERFORMANCE_REQUEST_TIMEOUT_MS, 15_000, 1_000, 60_000),
    p95LatencyMs: integer(process.env.PERFORMANCE_P95_BUDGET_MS, 1_500, 100, 10_000),
    maxErrorRatePercent: integer(process.env.PERFORMANCE_MAX_ERROR_RATE_PERCENT, 1, 0, 20),
    loadConcurrency: integer(process.env.PERFORMANCE_LOAD_CONCURRENCY, 20, 1, 200),
    loadRequests: integer(process.env.PERFORMANCE_LOAD_REQUESTS, 200, 20, 20_000),
    databasePoolMax: integer(process.env.DATABASE_POOL_MAX, 10, 2, 100),
    databasePoolTimeoutSeconds: integer(process.env.DATABASE_POOL_TIMEOUT_SECONDS, 10, 1, 60)
  };
  const controls = {
    capacity: process.env.PERFORMANCE_CAPACITY_READY === "true",
    databasePool: process.env.PERFORMANCE_DATABASE_POOL_READY === "true" && databaseUrlPoolMatches(budgets.databasePoolMax, budgets.databasePoolTimeoutSeconds),
    loadTest: process.env.PERFORMANCE_LOAD_TEST_READY === "true"
  };
  const evidence = {
    loadAgeDays: evidenceAgeDays(process.env.PERFORMANCE_LOAD_TESTED_AT),
    databaseAgeDays: evidenceAgeDays(process.env.PERFORMANCE_DATABASE_TESTED_AT),
    cacheAgeDays: evidenceAgeDays(process.env.PERFORMANCE_CACHE_TESTED_AT)
  };
  const evidenceFresh = Object.values(evidence).every((age) => age !== null && age <= 30);
  return { budgets, controls, evidence, evidenceFresh, live: Object.values(controls).every(Boolean) && evidenceFresh };
}

function databaseUrlPoolMatches(poolMax: number, poolTimeoutSeconds: number) {
  if (!process.env.DATABASE_URL) return process.env.NODE_ENV !== "production";
  try {
    const url = new URL(process.env.DATABASE_URL);
    return Number(url.searchParams.get("connection_limit")) === poolMax && Number(url.searchParams.get("pool_timeout")) === poolTimeoutSeconds;
  } catch {
    return false;
  }
}
