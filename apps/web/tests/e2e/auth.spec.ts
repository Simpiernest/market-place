import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');

    // Look for signup link or button
    const signupLink = page.locator('a[href*="signup"], a[href*="auth"], button').filter({ hasText: /sign up|get started|join/i }).first();

    if (await signupLink.count() > 0) {
      await signupLink.click();
      await expect(page).toHaveURL(/signup|auth/);
    }
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/auth/login');

    // Verify form elements exist
    await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button').filter({ hasText: /log in|sign in/i })).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /log in|sign in/i }).first();

    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();

    // HTML5 validation or custom error should appear
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid || await page.locator('text=/invalid|error/i').count() > 0).toBeTruthy();
  });
});
