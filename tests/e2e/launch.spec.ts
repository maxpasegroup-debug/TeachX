import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/teachers", "/save-time", "/earn-more", "/learn-more", "/enjoy-more", "/tara", "/pricing", "/trust", "/login", "/signup/teacher", "/signup/student", "/verify-email?invalid=1"];

for (const route of publicRoutes) {
  test(`${route} renders as a public page`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });
}

test("private pages redirect to login", async ({ page }) => {
  await page.goto("/teacher");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fteacher/);
});

test("private APIs fail closed without a session", async ({ request }) => {
  const response = await request.get("/api/launch/readiness", { maxRedirects: 0 });
  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({ error: "Unauthorized" });
});

test("public probes remain available and identifiable", async ({ request }) => {
  const requestId = "phase12-correlation-check";
  const response = await request.get("/api/health", { headers: { "x-request-id": requestId } });
  expect(response.status()).toBe(200);
  expect(response.headers()["x-request-id"]).toBe(requestId);
  await expect(response.json()).resolves.toMatchObject({ ok: true, service: "teachx" });
});

test("observability readiness remains restricted to platform operators", async ({ request }) => {
  const response = await request.get("/api/observability/readiness", { maxRedirects: 0 });
  expect(response.status()).toBe(401);
});

test("recovery readiness remains restricted to platform operators", async ({ request }) => {
  const response = await request.get("/api/backup/readiness", { maxRedirects: 0 });
  expect(response.status()).toBe(401);
});

test("payment operations remain restricted and unsigned webhooks fail closed", async ({ request }) => {
  expect((await request.get("/api/payments/readiness", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/payments/refunds", { data: { orderId: "unauthorized-order", confirmation: "FULL_REFUND" }, maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/payments/checkout", { data: { orderId: "unauthorized-order" }, maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/payments/webhooks/stripe", { data: "{}", headers: { "content-type": "application/json" } })).status()).toBe(400);
  expect((await request.post("/api/payments/webhooks/razorpay", { data: "{}", headers: { "content-type": "application/json" } })).status()).toBe(400);
});

test("email operations remain restricted and unsigned delivery events fail closed", async ({ request }) => {
  expect((await request.get("/api/email/readiness", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/email/webhooks/resend", { data: "{}", headers: { "content-type": "application/json" } })).status()).toBe(400);
});

test("private storage operations remain restricted", async ({ request }) => {
  expect((await request.get("/api/storage/config", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/storage/readiness", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/storage/uploads", { data: {}, maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/storage/uploads/untrusted", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.delete("/api/storage/uploads/untrusted", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/storage/uploads/untrusted/parts/sign", { data: {}, maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/storage/uploads/untrusted/parts/record", { data: {}, maxRedirects: 0 })).status()).toBe(401);
  expect((await request.post("/api/storage/uploads/untrusted/complete", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/storage/objects/untrusted/download", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/resilience/readiness", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/globalization/readiness", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/performance/readiness", { maxRedirects: 0 })).status()).toBe(401);
});

test("the service worker is publicly available without an auth redirect", async ({ request }) => {
  const response = await request.get("/sw.js", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()["service-worker-allowed"]).toBe("/");
});

test("production responses include the security baseline", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
});

test("oversized API bodies are rejected at the request boundary", async ({ request }) => {
  const response = await request.post("/api/setup", {
    data: { payload: "x".repeat(1024 * 1024) }
  });
  expect(response.status()).toBe(413);
});
