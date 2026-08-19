# Phase 19: Global Scale and Performance

## Launch outcome

TeachX now has enforceable capacity and latency contracts for global traffic. Static framework assets are immutable, install assets use bounded stale revalidation, private APIs remain `no-store`, database readiness is time-bounded, temporary dependency failures carry `Retry-After`, and critical timeline queries have deployment-managed indexes.

## Performance budgets

- `PERFORMANCE_P95_BUDGET_MS=1500`: maximum p95 across the public mixed-route load probe.
- `PERFORMANCE_REQUEST_TIMEOUT_MS=15000`: individual load request deadline.
- `PERFORMANCE_MAX_ERROR_RATE_PERCENT=1`: allowed non-2xx/error percentage.
- `PERFORMANCE_LOAD_CONCURRENCY=20`: default concurrent virtual requests.
- `PERFORMANCE_LOAD_REQUESTS=200`: default request count per certification run.
- `PERFORMANCE_DATABASE_TIMEOUT_MS=3000`: readiness database deadline.
- `DATABASE_POOL_MAX=10`: maximum Prisma connections per Railway application replica.
- `DATABASE_POOL_TIMEOUT_SECONDS=10`: Prisma pool checkout timeout.

The pool values must also be encoded in `DATABASE_URL`, for example `?connection_limit=10&pool_timeout=10`. When other query parameters already exist, append them with `&`. Multiply `DATABASE_POOL_MAX` by the maximum Railway replica count and keep the total comfortably below the PostgreSQL connection limit, reserving capacity for migrations, backup, and operator access.

## Cache and overload contract

- `/api/*` responses remain `no-store` so private or tenant-specific data cannot leak through shared caches.
- hashed `/_next/static/*` assets use one-year immutable caching.
- install icons use one-day freshness and seven-day stale revalidation.
- the service worker retains the stricter Phase 17 private-cache exclusions.
- readiness and request-protection dependency failures return `503` with `Retry-After: 5`.
- database readiness returns within the configured deadline even if PostgreSQL is unhealthy.

## Database indexes

Migration `20260819160000_add_scale_hot_path_indexes` adds indexes for:

- per-user notification status timelines;
- institution notification timelines;
- preference-key readiness scans;
- institution, actor, and entity audit timelines;
- institution content workflow ordering.

Run migrations before raising traffic. The live verifier reads `pg_indexes` and fails if critical indexes are absent.

## Railway variables

Set the Phase 19 variables from `.env.example`. After the production drill, set all three `PERFORMANCE_*_READY` controls to `true` and provide current ISO-8601 UTC timestamps for load, database, and cache evidence. Evidence expires after 30 days.

## Production drill

1. Apply migrations and confirm the seven Phase 19 indexes exist.
2. Set a Railway replica ceiling and calculate the total database connection budget.
3. Add matching `connection_limit` and `pool_timeout` parameters to `DATABASE_URL`.
4. Deploy, warm the site, and run `PERFORMANCE_BASE_URL=https://your-domain npm run performance:load` from a region near the primary audience and one distant region.
5. Repeat at expected peak concurrency and at twice expected peak. Confirm p95, p99, throughput, error rate, CPU, memory, database CPU, connection usage, and egress.
6. Restart one application replica during sustained traffic. Confirm health recovery and no unsafe paid or write replay.
7. Temporarily block database connectivity in a controlled environment. Confirm readiness returns `503` within budget with `Retry-After` and Railway removes the replica.
8. Verify private APIs are `no-store`, hashed assets are immutable, and icons carry stale revalidation.
9. Set fresh evidence timestamps and run `SMOKE_BASE_URL=https://your-domain npm run performance:verify`.
10. Run `npm run launch:gate:production`.

The local load test proves the harness and application behavior on one machine. It is not evidence of Railway capacity; production sign-off deliberately requires fresh deployed measurements.
