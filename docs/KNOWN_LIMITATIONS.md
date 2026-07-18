# TeachX Guru Known Limitations

## Launch Limitations

- Payment gateways are architected but not live.
- Payouts, commission settlement, and revenue reconciliation are not live.
- Realtime messaging, video calling, voice calling, and push provider integrations are not live.
- OCR, advanced file extraction, and live document provider integrations are placeholders.
- Lighthouse scores must be captured from the deployed production URL.

## UX Limitations

- Hero people assets are replaceable launch visuals and should be upgraded to final branded photography when available.
- The Open Graph image currently uses the app icon instead of a dedicated launch preview graphic.
- Some admin/RBAC internals retain legacy Education OS role naming even though the user-facing experience is TeachX Guru.

## Operations Limitations

- External monitoring, incident alerting, and BI integrations should be connected after deployment.
- Production support workflows require named owners before public traffic.
- Provider-specific billing, messaging, email, WhatsApp, and storage credentials must be verified in Railway before enabling those workflows.
