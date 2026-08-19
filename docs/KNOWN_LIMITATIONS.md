# TeachX Guru Known Limitations

## Launch Limitations

- Payment gateways are architected but not live.
- Payouts, commission settlement, and revenue reconciliation are not live.
- Realtime messaging, video calling, voice calling, and push provider integrations are not live.
- OCR, advanced file extraction, and live document provider integrations are placeholders.
- Bulk marketing email, SMS, WhatsApp, and push delivery are outside the transactional Phase 15 launch channel.
- Lighthouse scores must be captured from the deployed production URL.
- Real-device PWA install, offline draft restoration, and interrupted multipart resume require the Phase 17 production drill and fresh Railway evidence before they are marked live.
- Locale formatting, RTL rendering, keyboard navigation, reduced motion, and high contrast require the Phase 18 production drill and fresh Railway evidence before they are marked live.
- Phase 18 provides certified locale mechanics for eight regions; translated interface catalogs and translated legal/support content must be human-reviewed before any language is marketed as fully translated.
- Railway capacity, multi-region latency, replica recovery, and database saturation require the Phase 19 deployed load drill and fresh production evidence before global scale is marked live.

## UX Limitations

- Hero people assets are replaceable launch visuals and should be upgraded to final branded photography when available.
- The Open Graph image currently uses the app icon instead of a dedicated launch preview graphic.
- Some admin/RBAC internals retain legacy Education OS role naming even though the user-facing experience is TeachX Guru.

## Operations Limitations

- External monitoring, incident alerting, and BI integrations should be connected after deployment.
- Production support workflows require named owners before public traffic.
- Provider-specific billing, messaging, email, WhatsApp, and private storage credentials must be verified in Railway before enabling those workflows. Storage remains fail-closed until its private-bucket, CORS, retention, cleanup, upload, and download evidence is current.
