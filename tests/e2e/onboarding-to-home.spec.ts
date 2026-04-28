import { test, expect } from "../../playwright-fixture";

test.describe("Onboarding skip → Home → Card detail → Back", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we always start fresh: clear flags that could pre-skip onboarding
    await page.addInitScript(() => {
      try {
        window.localStorage.clear();
      } catch {}
    });
  });

  test("skip onboarding, open card detail, go back, then forward", async ({ page }) => {
    await page.goto("/");

    // Onboarding carousel: Skip link is visible
    const skipBtn = page.getByText("Skip →");
    await expect(skipBtn).toBeVisible();

    // Skip → land on /home
    await skipBtn.click();
    await expect(page).toHaveURL(/\/home$/);

    // Hero card tile (first card label) is visible on Home
    const cardTile = page.getByText("Axis Flipkart").first();
    await expect(cardTile).toBeVisible();

    // Click into the first card → /cards/0
    await cardTile.click();
    await expect(page).toHaveURL(/\/cards\/0$/);

    // Browser back → /home, hero restored from URL
    await page.goBack();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText("Axis Flipkart").first()).toBeVisible();

    // Browser forward → back at /cards/0
    await page.goForward();
    await expect(page).toHaveURL(/\/cards\/0$/);
  });
});
