import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/pricing", "/trust", "/login", "/signup/teacher", "/signup/student", "/verify-email?invalid=1"];

for (const route of routes) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("keyboard skip navigation is visible and targets the main content", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("Arabic locale is server-rendered RTL without accessibility regressions", async ({ context, page }) => {
  await context.addCookies([
    { name: "teachx_locale", value: "ar-SA", domain: "127.0.0.1", path: "/" },
    { name: "teachx_motion", value: "reduce", domain: "127.0.0.1", path: "/" },
    { name: "teachx_contrast", value: "high", domain: "127.0.0.1", path: "/" }
  ]);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", "ar-SA");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
