import { test, expect } from '@playwright/test';

test.describe('Deal Flow', () => {
  test.skip('should create an offer on a listing', async ({ page }) => {
    // Skip by default as it requires authentication
    await page.goto('/marketplace');

    // Find a listing
    const firstListing = page.locator('[data-testid*="listing"], .listing-card, article').first();
    if (await firstListing.count() > 0) {
      await firstListing.click();

      // Look for "Make Offer" button
      const offerButton = page.locator('button').filter({ hasText: /make offer|submit offer/i }).first();

      if (await offerButton.count() > 0) {
        await offerButton.click();

        // Fill offer form
        await page.locator('input[name*="amount"], input[type="number"]').first().fill('95000');
        await page.locator('textarea, input[name*="terms"]').first().fill('Cash payment');

        // Submit offer
        await page.locator('button[type="submit"]').click();

        await page.waitForTimeout(1000);
      }
    }
  });

  test('should navigate to deals dashboard', async ({ page }) => {
    await page.goto('/dashboard/deals');

    // Should redirect to login if not authenticated, or show deals page
    const url = page.url();
    expect(url).toMatch(/dashboard\/deals|auth\/login/);
  });
});
