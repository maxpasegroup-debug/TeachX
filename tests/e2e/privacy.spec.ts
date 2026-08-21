import { expect, test } from "@playwright/test";

test("first visit offers granular privacy choices", async ({ page }) => {
  await page.goto("/privacy");
  const dialog = page.getByRole("dialog", { name: "Privacy choices" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Essential", { exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel(/analytics/i)).toHaveCount(0);
  await dialog.getByRole("button", { name: "Customize" }).click();
  await expect(dialog.getByLabel("Essential", { exact: true })).toBeChecked();
  await expect(dialog.getByLabel(/analytics/i)).not.toBeChecked();
  await expect(dialog.getByLabel(/marketing/i)).not.toBeChecked();
});

test("a recorded browser choice suppresses the first-visit dialog", async ({ context, page }) => {
  await context.addCookies([{ name: "teachx_privacy", value: encodeURIComponent(JSON.stringify({ functional: false, analytics: false, marketing: false })), domain: "127.0.0.1", path: "/" }]);
  await page.goto("/privacy");
  await expect(page.getByRole("dialog", { name: "Privacy choices" })).toHaveCount(0);
});

test("privacy account and administration surfaces fail closed anonymously", async ({ request }) => {
  expect((await request.get("/api/privacy/requests", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/privacy/export", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/privacy/admin/requests", { maxRedirects: 0 })).status()).toBe(401);
  expect((await request.get("/api/privacy/readiness", { maxRedirects: 0 })).status()).toBe(401);
});
