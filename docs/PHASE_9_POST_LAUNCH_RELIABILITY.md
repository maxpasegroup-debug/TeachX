# Phase 9 Post-Launch Reliability

Status: operational monitoring and incident-response package

Phase 9 gives teachers a privacy-safe status page and gives operators a strict monitor that can run from a scheduler or uptime platform.

## Public Status

- `/status` shows a plain-language live snapshot for teachers.
- `/api/status` returns the same sanitized component status for integrations.
- Database errors, missing secrets, provider names, and internal configuration details are never returned by the public status API.
- `/api/ready` remains the strict, sanitized deployment probe and should not be used as the teacher-facing status display.

## Production Monitor

Run one check against production:

```bash
MONITOR_BASE_URL=https://teachx.guru npm run launch:monitor
```

Windows PowerShell:

```powershell
$env:MONITOR_BASE_URL="https://teachx.guru"; npm run launch:monitor
```

The monitor fails when health, strict readiness, public status, expected release version, response-time limits, or browser security headers fail. Configure `MONITOR_MAX_LATENCY_MS`, `MONITOR_TIMEOUT_MS`, and `MONITOR_EXPECTED_VERSION` when needed. Set `MONITOR_JSON=1` for machine-readable output.

Run it every five minutes from one external region. During launch week, route a non-zero result to the named incident owner. External scheduling and notifications must be configured in the chosen hosting or monitoring provider.

## Incident Severity

- `SEV-1`: security/data exposure, incorrect paid entitlement, authentication unavailable, or the teacher workspace is broadly unavailable. Pause traffic immediately.
- `SEV-2`: AI creation, saving, exports, or support intake broadly degraded with a workaround available. Respond within 30 minutes during the launch window.
- `SEV-3`: isolated defect, confusing copy, or a small cohort affected. Triage in the normal support queue.

## Response Flow

1. Acknowledge the alert and name one incident owner.
2. Verify `/api/health`, `/api/ready`, `/api/version`, `/api/status`, deployment logs, and recent support tickets.
3. Record the start time, affected workflow, release commit, scope, and current workaround.
4. For SEV-1, pause paid promotion and new marketing traffic while impact is assessed.
5. Update the public status message through the deployment or communication process if teachers are affected.
6. Roll back using `docs/PHASE_8_RELEASE_GATE.md` when the current release cannot be safely restored quickly.
7. Run `launch:gate:production` before declaring recovery.

## Recovery Standard

Recovery requires two consecutive successful monitor runs, a successful manual teacher workflow, support intake confirmation, and no active data-access or payment-entitlement concern. Record the cause, impact, resolution, owner, and prevention work within two business days.
