# Commerce Guide

The Commerce OS manages subscriptions, AI credits, wallets, orders, invoices, coupons, referrals, and ownership architecture.

## Current State

- Payment gateway abstractions are prepared for Razorpay and Stripe.
- No live checkout or payout flow is enabled.
- Wallets, orders, subscriptions, and AI credit data are available to admin dashboards.

## Launch Checks

- Keep payment secrets unset until gateway onboarding is complete.
- Use admin commerce analytics to review orders, transactions, wallets, and subscriptions.
- Confirm premium resource ownership before enabling live payments.
