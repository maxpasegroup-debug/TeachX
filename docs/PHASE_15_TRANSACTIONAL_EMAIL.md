# Phase 15: Transactional Email

Phase 15 makes account security and commerce email a production capability through Resend. The launch scope is intentionally transactional: email verification, welcome, password reset, payment confirmation, and refund confirmation. Bulk and marketing campaigns are not sent through this channel.

## Production contract

- Verify the `EMAIL_FROM` domain in Resend and publish its SPF and DKIM records.
- Publish and monitor a DMARC record. Move from monitoring to quarantine or reject only after every legitimate sender is aligned.
- Register `https://<production-domain>/api/email/webhooks/resend` for `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`.
- Store the webhook signing secret separately from the API key.
- Set every email variable in `.env.example`; enable `EMAIL_LIVE` only after domain, DMARC, transactional, and webhook checks are complete.
- Run `npx prisma migrate deploy` before enabling delivery.

## Security and privacy

Reset and verification tokens are random, hashed at rest, expiring, and one-time. Reset completion atomically claims the token, changes the password, invalidates remaining reset links, and revokes active sessions. Public responses do not reveal whether an email address has an account.

TeachX stores delivery status, provider message/event IDs, recipient hash and domain, error category, and payload hash. It does not store raw webhook payloads or duplicate recipient addresses in the delivery ledger. Dynamic template content is HTML-escaped and every message has a plain-text alternative.

Provider idempotency keys and a unique local key prevent duplicate sends. Signed webhook events are deduplicated by `svix-id`; out-of-order events cannot regress a terminal delivery state.

## Launch evidence

1. Deliver and open a verification email, then confirm `emailVerifiedAt` is set and the link cannot be reused.
2. Deliver a password reset, complete it, confirm the link cannot be reused, and confirm old sessions are revoked.
3. Deliver the welcome email after verification.
4. Confirm payment and full-refund emails during the Phase 14 live micro-transaction tests.
5. Confirm delivered events for all five message kinds in the admin readiness panel.
6. Set `EMAIL_WEBHOOK_TESTED_AT` and `EMAIL_DELIVERY_TESTED_AT` to the UTC completion times.
7. Run `npm run email:audit`, `npm run email:test`, `npm run email:verify`, and finally `npm run launch:gate:production` from Railway.

`email:verify` independently checks the Resend account, verified sender domain, enabled production webhook and subscribed events, freshness attestations, and database delivery evidence for every launch-critical message kind.

## Operations

Investigate delayed email, bounces, complaints, suppressions, or failures from `/admin/settings` and the Resend dashboard. Do not repeatedly send to a bounced, complained, or suppressed address. Rotate compromised credentials immediately. Set `EMAIL_LIVE=false` to stop new transactional sends while preserving in-app access and delivery evidence.
