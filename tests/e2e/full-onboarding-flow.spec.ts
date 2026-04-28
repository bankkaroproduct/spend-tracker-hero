import { test, expect } from "../../playwright-fixture";

test.describe("Full onboarding: phone → OTP → SMS → home → card → back", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.clear();
      } catch {}
    });
  });

  test("completes onboarding wizard and verifies back-button after card detail", async ({ page }) => {
    await page.goto("/");

    // Step 0: value-prop carousel
    await expect(page.getByText("Get Started")).toBeVisible();
    await page.getByText("Get Started").click();

    // Step 1: phone input
    const phoneInput = page.locator('input[type="tel"]').first();
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill("9876543210");
    await page.getByText("Next").click();

    // Step 2: OTP input (single hidden tel input overlaying 6 boxes)
    const otpInput = page.locator('input[type="tel"]').first();
    await expect(otpInput).toBeVisible();
    await otpInput.fill("123456");
    await page.getByText("Next").click();

    // Step 3: SMS permission
    const allowSmsBtn = page.getByText("Allow SMS Permissions");
    await expect(allowSmsBtn).toBeVisible();
    await allowSmsBtn.click();

    // Native-like dialog → Allow
    const allowBtn = page.getByText("Allow", { exact: true }).last();
    await expect(allowBtn).toBeVisible();
    await allowBtn.click();

    // After 2s auto-nav, URL becomes /building
    await page.waitForURL(/\/building$/, { timeout: 5000 });

    // Skip the long building animation: jump straight to /home (URL→state sync handles it)
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText("Axis Flipkart").first()).toBeVisible();

    // Open card detail
    await page.getByText("Axis Flipkart").first().click();
    await expect(page).toHaveURL(/\/cards\/\d+$/);

    // Back → home
    await page.goBack();
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText("Axis Flipkart").first()).toBeVisible();
  });
});
