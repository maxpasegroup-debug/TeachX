import { expect, test } from "@playwright/test";

const viewports = [
  { name: "360", width: 360, height: 740 },
  { name: "390", width: 390, height: 844 },
  { name: "414", width: 414, height: 896 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 }
];

for (const viewport of viewports) {
  test(`P17 public and protected journeys fit ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of ["/", "/pricing", "/login", "/signup/teacher", "/trust"]) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
    }
    for (const route of ["/teacher", "/tara", "/teacher/resources", "/teacher/workspace/planner", "/teacher/business/profile-preview"]) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/login\\?callbackUrl=${encodeURIComponent(route)}`));
    }
  });
}

test("P17 public calls to action use canonical teacher signup", async ({ page }) => {
  await page.goto("/");
  const starts = page.getByRole("link", { name: /start free/i });
  expect(await starts.count()).toBeGreaterThan(0);
  for (let index = 0; index < await starts.count(); index += 1) await expect(starts.nth(index)).toHaveAttribute("href", "/signup/teacher");
});
