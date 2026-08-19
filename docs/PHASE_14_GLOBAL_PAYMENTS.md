# Phase 14: Global Payment Integrity

Phase 14 makes INR checkout use Razorpay and non-INR checkout use Stripe. Both are hosted provider experiences. TeachX never accepts card data and never grants paid access from a browser callback.

## Production contract

- Configure Razorpay live keys and a webhook at `/api/payments/webhooks/razorpay` for `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`, and `refund.failed`.
- Configure Stripe live keys and a webhook at `/api/payments/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `refund.updated`.
- Set every payment variable in `.env.example`. `PAYMENTS_LIVE`, tax, refund, and reconciliation controls must all be `true` before checkout opens.
- Keep webhook secrets separate from API keys. Rotate a leaked key or webhook secret immediately.
- Run `npx prisma migrate deploy` before enabling `PAYMENTS_LIVE`.

## Fulfillment and refunds

Signed, raw-body webhooks are the only paid-access authority. Every event is deduplicated by provider event ID, checked against the server-owned order amount, currency, provider, and payment identifiers, and applied in a serializable transaction. The database stores a payload hash and minimal identifiers, never the raw provider payload.

Subscription purchases are prepaid periods, not automatic recurring mandates. A successful full-refund webhook expires the purchased subscription, revokes resource access, offsets AI credits and seller earnings, cancels the invoice, and creates a unique credit note. The admin action only submits a refund; it does not reverse access until the provider confirms it.

## Tax and legal boundary

`PAYMENT_TAX_READY=true` is an operator attestation that the displayed prices, tax calculation, merchant identity, invoice wording, registrations, and cross-border obligations have been reviewed for the countries being sold into. The software does not replace tax or legal advice. Keep unsupported countries blocked at the provider account level until reviewed.

## Launch evidence

1. Complete one low-value live INR purchase and full refund through Razorpay.
2. Complete one low-value live USD purchase and full refund through Stripe.
3. Confirm the order, subscription/resource/credits, invoice, refund reversal, credit note, and notification in TeachX.
4. Set `PAYMENT_WEBHOOK_TESTED_AT` to the UTC completion time and `PAYMENT_RECONCILED_AT` to the latest provider-to-ledger reconciliation time.
5. Run `npm run payments:audit`, `npm run payments:test`, and `npm run payments:verify` from the Railway production environment.
6. Run `npm run launch:gate:production` only after the provider tests pass.

`payments:verify` fails unless both credentials are live, provider APIs respond, attestations are fresh, and the ledger contains a processed event from each provider within 30 days. Reconcile settlements, fees, taxes, chargebacks, refunds, and ledger totals daily; investigate any failed event shown in the admin readiness panel before accepting more paid orders.

## Incident response

Set `PAYMENTS_LIVE=false` to stop new checkout without affecting existing accounts. Preserve provider and TeachX event identifiers, inspect Sentry/request IDs, reconcile in provider dashboards, and use the full-refund action only after confirming order ownership and amount. Never manually mark an order paid.
