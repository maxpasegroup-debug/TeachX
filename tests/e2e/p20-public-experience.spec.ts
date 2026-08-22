import { expect, test } from "@playwright/test";

const routes = ["/", "/save-time", "/earn-more", "/learn-more", "/enjoy-more", "/tara", "/pricing"];
const lockedWidths = [360, 390, 414, 768, 1024, 1280, 1440];

test("P20 Home is composed for every locked launch width", async ({ page }) => {
  for (const width of lockedWidths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${width}px`).toBe(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${width}px horizontal overflow`).toBeLessThanOrEqual(1);
    await expect(page.getByRole("heading", { name: "More time for the life you teach for." })).toBeVisible();
  }
});

test("P20 public routes render and remain within the viewport", async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

test("P20 desktop navigation reaches every public world", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop navigation is replaced by the mobile menu.");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Public navigation" });
  for (const [label, href] of [["Save Time", "/save-time"], ["Earn More", "/earn-more"], ["Learn More", "/learn-more"], ["Enjoy More", "/enjoy-more"], ["TARA", "/tara"], ["Pricing", "/pricing"]]) {
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
  }
});

test("P20 mobile menu is reachable and contains every public world", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile menu is only visible below the desktop breakpoint.");
  await page.goto("/");
  await page.getByTitle("Open menu").click();
  const nav = page.getByRole("navigation", { name: "Mobile public navigation" });
  await expect(nav).toBeVisible();
  for (const label of ["Save Time", "Earn More", "Learn More", "Enjoy More", "TARA", "Pricing", "Sign In"]) await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
});

test("P20 calls to action use the canonical teacher signup", async ({ page }) => {
  await page.goto("/");
  const starts = page.getByRole("link", { name: /^Start Free$/i });
  expect(await starts.count()).toBeGreaterThan(0);
  for (let index = 0; index < await starts.count(); index += 1) await expect(starts.nth(index)).toHaveAttribute("href", "/signup/teacher");
});

test("P20 unknown public URLs retain real 404 behavior", async ({ page }) => {
  const response = await page.goto("/not-a-teachx-public-world", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
});
