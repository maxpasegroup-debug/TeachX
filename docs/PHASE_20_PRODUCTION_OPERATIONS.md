# Phase 20: Production Operations and Incident Command

Phase 20 turns launch readiness into a repeatable live-service operating model. It adds durable incidents, append-only updates, public communication, maintenance notices, emergency write freeze, SLO ownership, and expiring drill evidence.

## Railway setup

1. Assign different people or rotations to `OPERATIONS_PRIMARY_ONCALL` and `OPERATIONS_SECONDARY_ONCALL`.
2. Set `OPERATIONS_INCIDENT_CHANNEL` to the private incident room and `OPERATIONS_ALERT_DESTINATION` to the tested pager destination. Values are never returned by readiness APIs.
3. Confirm the default SLOs: 99.9% availability, p95 under 1500 ms, SEV1 acknowledgement within 5 minutes, and SEV2 acknowledgement within 15 minutes.
4. Set all four `OPERATIONS_*_READY` controls to `true` only after the drill below passes.
5. Record the four evidence timestamps in ISO 8601 UTC and set `OPERATIONS_INCIDENT_DRILL_ID` to the resolved public drill record. Evidence expires after 30 days by default.
6. Apply migration `20260819190000_add_production_operations` before deploying application code.

## Monthly drill

1. Trigger a non-customer synthetic alert and confirm primary acknowledgement plus secondary escalation.
2. Open `/admin/incidents`, create a `SEV2` incident with **This is a drill**, assign a commander, and select at least one component.
3. Confirm the investigating update appears at `/status` without the internal note, actor ID, or tenant data.
4. Move the drill through `IDENTIFIED`, `MONITORING`, and `RESOLVED`; publish a plain-language update at every step.
5. Schedule a short maintenance notice, verify it at `/status`, then end it.
6. Exercise the Railway rollback to the prior image and verify `/api/version`, `/api/ready`, authentication, teacher workspace, payment webhooks, and email webhooks.
7. Set `OPERATIONS_WRITE_FREEZE=true` in a staging deployment. Confirm a normal API mutation returns `503` and `Retry-After`, while health and provider webhooks are not blocked. Return it to `false`.
8. Update the four evidence timestamps, record the resolved incident ID in `OPERATIONS_INCIDENT_DRILL_ID`, and run `npm run operations:verify` against production.

## Incident rules

- `SEV1`: broad outage, data integrity risk, authentication failure, or payment entitlement failure. Page both rotations immediately and consider rollback/write freeze.
- `SEV2`: important service is degraded with a workaround or limited scope. Acknowledge within 15 minutes.
- `SEV3`: small, contained impact. Track during normal response without understating a wider failure.
- Incident states only move forward: investigating, identified, monitoring, resolved. A resolved incident is immutable; open a new linked incident if impact returns.
- Public updates contain impact, current state, workaround when available, and the next update expectation. Never include names, emails, tenant IDs, stack traces, keys, or internal hypotheses.

## Launch and rollback decision

Do not launch or continue a rollout when the operations verifier fails, a SEV1 is active, ownership is unassigned, alert routing fails, or drill evidence is stale. Roll back on readiness failure, authentication regression, data integrity risk, verified paid-access failure, or sustained SLO breach. The incident commander owns the decision and records it in the incident timeline.

## Commands

```bash
npm run operations:audit
npm run operations:test
SMOKE_BASE_URL=https://teachx.guru npm run operations:verify
npm run launch:gate:production
```
