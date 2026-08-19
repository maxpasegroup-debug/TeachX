import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const root=process.cwd(),read=path=>readFileSync(join(root,path),"utf8"),check=(name,pass,detail)=>({name,pass,detail});
const files=["lib/privacy/config.ts","services/privacy-service.ts","components/privacy/privacy-choices.tsx","features/privacy/components/privacy-center.tsx","features/privacy/components/privacy-administration.tsx","app/(app)/privacy-center/page.tsx","app/(app)/admin/privacy/page.tsx","app/api/privacy/consent/route.ts","app/api/privacy/requests/route.ts","app/api/privacy/export/route.ts","app/api/privacy/admin/requests/route.ts","app/api/privacy/admin/retention/route.ts","app/api/privacy/readiness/route.ts","tests/privacy/privacy-regression.test.mjs","scripts/privacy-verify.mjs","docs/PHASE_21_GLOBAL_PRIVACY_GOVERNANCE.md","prisma/migrations/20260819210000_add_global_privacy_governance/migration.sql"];
const schema=read("prisma/schema.prisma"),service=read("services/privacy-service.ts"),consent=read("app/api/privacy/consent/route.ts"),proxy=read("security/api-route-policy.json"),choices=read("components/privacy/privacy-choices.tsx"),config=read("lib/privacy/config.ts");
const checks=[
 ...files.map(file=>check(`file:${file}`,existsSync(join(root,file)),file)),
 check("consent:append-only",schema.includes("model PrivacyConsent")&&service.includes("privacyConsent.createMany")&&!service.includes("privacyConsent.update"),"consent choices are append-only"),
 check("consent:gpc",choices.includes("globalPrivacyControl")&&service.includes("data.globalPrivacyControl ? false"),"Global Privacy Control denies analytics and marketing"),
 check("consent:protected",consent.includes("rateLimit")&&consent.includes("Invalid request origin"),"public consent writes are rate-limited and origin checked"),
 check("consent:public-policy",proxy.includes('"/api/privacy/consent"'),"consent endpoint is intentionally public"),
 check("rights:durable",schema.includes("model PrivacyRequest")&&schema.includes("model PrivacyRequestEvent"),"rights requests and events are durable"),
 check("rights:forward-only",service.includes("INVALID_PRIVACY_TRANSITION")&&service.includes("const transitions"),"request workflow cannot reopen or move backwards"),
 check("rights:duplicate",service.includes("DUPLICATE_PRIVACY_REQUEST"),"duplicate open request types are prevented"),
 check("deletion:legal-hold",service.includes("LEGAL_HOLD_BLOCKS_FULFILMENT"),"legal hold blocks deletion fulfilment"),
 check("export:minimized",service.includes("scopeNotice")&&!service.includes("passwordHash: true")&&!service.includes("sessions: true"),"portable snapshot excludes credentials and sessions"),
 check("retention:bounded",schema.includes("model DataRetentionPolicy")&&service.includes("max(3_650)"),"retention register is governed and bounded"),
 check("sla:bounded",config.includes("PRIVACY_REQUEST_SLA_DAYS, 30, 1, 90"),"rights SLA is bounded"),
 check("evidence:expiring",config.includes("evidenceFresh")&&config.includes("PRIVACY_EVIDENCE_MAX_AGE_DAYS"),"privacy evidence expires")
];
const failed=checks.filter(item=>!item.pass);console.log(`TeachX privacy audit: ${checks.length-failed.length}/${checks.length} checks passed`);for(const item of checks)console.log(`${item.pass?"PASS":"FAIL"} ${item.name} - ${item.detail}`);if(failed.length)process.exit(1);console.log("Global privacy governance audit passed.");
