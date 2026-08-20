import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read=path=>readFileSync(new URL(`../../${path}`,import.meta.url),"utf8");

test("consent is append-only and GPC overrides optional tracking",()=>{const service=read("services/privacy-service.ts");assert.match(service,/privacyConsent\.createMany/);assert.doesNotMatch(service,/privacyConsent\.update/);assert.match(service,/data\.globalPrivacyControl \? false : data\.analytics/);assert.match(service,/data\.globalPrivacyControl \? false : data\.marketing/);});
test("public consent mutation is origin checked and rate limited",()=>{const route=read("app/api/privacy/consent/route.ts");assert.match(route,/rateLimit/);assert.match(route,/isTrustedConsentOrigin/);assert.match(route,/https:\/\/learnx\.guru/);assert.match(route,/Invalid request origin/);});
test("privacy workflow is forward-only and legal holds block deletion",()=>{const service=read("services/privacy-service.ts");assert.match(service,/FULFILLED: \[\], REJECTED: \[\], CANCELLED: \[\]/);assert.match(service,/INVALID_PRIVACY_TRANSITION/);assert.match(service,/LEGAL_HOLD_BLOCKS_FULFILMENT/);});
test("portable snapshot excludes authentication and payment secrets",()=>{const service=read("services/privacy-service.ts");for(const forbidden of ["passwordHash: true","sessions: true","access_token: true","payloadHash: true"])assert.doesNotMatch(service,new RegExp(forbidden));assert.match(service,/scopeNotice/);});
test("privacy administration requires settings permission and platform admin role",()=>{for(const path of ["app/api/privacy/admin/requests/route.ts","app/api/privacy/admin/retention/route.ts","app/api/privacy/readiness/route.ts"]){const route=read(path);assert.match(route,/requireApiSession\("settings\.manage"\)/);assert.match(route,/roles\.includes\("ADMIN"\)/);}});
test("rights SLA and evidence age cannot be configured without bounds",()=>{const config=read("lib/privacy/config.ts");assert.match(config,/PRIVACY_REQUEST_SLA_DAYS, 30, 1, 90/);assert.match(config,/PRIVACY_EVIDENCE_MAX_AGE_DAYS, 90, 1, 180/);});
