import { expect, test } from "@playwright/test";

const publicJourneys = ["/", "/pricing", "/login", "/signup/teacher"];

for (const route of publicJourneys) {
  test(`${route} has no horizontal viewport overflow`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test("invalid public routes return a real not-found response", async ({ page }) => {
  const response = await page.goto("/teachx-route-that-does-not-exist", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
});

for (const route of ["/teacher/life/save-time", "/tara", "/teacher/business/subscription", "/teacher/settings", "/teacher/support"]) {
  test(`${route} fails closed without a teacher session`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/login\\?callbackUrl=${encodeURIComponent(route)}`));
  });
}
