# Phase 21: Global Privacy Governance

Phase 21 turns the public privacy promise into operating controls. It provides an append-only consent ledger, Global Privacy Control handling, a user Privacy Center, portable account snapshots, formal rights requests, administrator SLA tracking, legal holds, forward-only audit events, and a reviewed retention register.

## Railway setup

1. Apply migration `20260819210000_add_global_privacy_governance` before deploying application code.
2. Assign `PRIVACY_CONTACT_EMAIL` to a monitored privacy address. Do not use an individual employee's private inbox.
3. Confirm the rights-response SLA with counsel and set `PRIVACY_REQUEST_SLA_DAYS`; the application accepts 1-90 days and defaults to 30.
4. Maintain an approved processor/subprocessor register covering hosting, database, email, AI, payments, storage, error monitoring, support, and analytics.
5. Complete a transfer-impact review for cross-border processing and document the lawful transfer mechanism where required.
6. Set readiness controls to `true` only after the drill below, then record all four UTC evidence timestamps. Evidence expires after 90 days by default.

## Rights request drill

1. Sign in as a test teacher, open `/privacy-center`, download the snapshot, and confirm it contains no password hash, session, token, private payment payload, or other user's data.
2. Submit Access, Correction, Export, Restriction, Objection, and Deletion requests. Confirm duplicate open types are rejected.
3. In `/admin/privacy`, move one request through identity verification, review, approval, and fulfilment. Confirm every state creates an append-only timeline event.
4. Place a legal hold on a test deletion and confirm fulfilment is blocked. Record the lawful resolution, then remove the test hold.
5. Confirm overdue requests make `/api/privacy/readiness` fail and are visible to administrators.
6. Test first-visit cookie choices, reject optional storage, customize categories, and enable browser Global Privacy Control. GPC must force analytics and marketing off.
7. Review each retention-register row against actual database, storage, backup, finance, security, support, and AI lifecycle behavior. Do not shorten statutory finance retention without counsel.
8. Refresh evidence timestamps and run `npm run privacy:verify` against production.

## Safety rules

- Identity documents must not be placed in free-text request notes or ordinary support attachments.
- A deletion request is a reviewed workflow, not an immediate cascade. Financial, fraud, safeguarding, institutional, dispute, and legal-hold records may require restriction or anonymization instead of deletion.
- The immediate JSON download is a minimized account snapshot. A complete statutory export, including large files and institution-controlled records, follows the reviewed Export workflow.
- Optional analytics or marketing tools must not initialize before the corresponding choice is granted. Essential session and security storage does not depend on optional consent.
- Policy text and operating configuration require qualified local legal review before entering a new jurisdiction.

## Commands

```bash
npm run privacy:audit
npm run privacy:test
SMOKE_BASE_URL=https://teachx.guru npm run privacy:verify
npm run launch:gate:production
```
