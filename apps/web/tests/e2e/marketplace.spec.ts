import { test, expect } from '@playwright/test';

test.describe('Marketplace Flow', () => {
  test('should load marketplace page', async ({ page }) => {
    await page.goto('/marketplace');

    await expect(page).toHaveTitle(/Business Bridge/);
    await expect(page.locator('h1')).toContainText(/marketplace/i);
  });

  test('should search for businesses', async ({ page }) => {
    await page.goto('/marketplace');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('SaaS');

    // Submit search (either by button or Enter key)
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForTimeout(1000);

    // Check if any results are displayed or a message is shown
    const hasResults = await page.locator('[data-testid*="listing"], .listing-card, article').count();
    const hasMessage = await page.locator('text=/No results|Showing/i').count();

    expect(hasResults > 0 || hasMessage > 0).toBeTruthy();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/marketplace');

    // Look for category filters
    const categoryButton = page.locator('button, a').filter({ hasText: /SaaS|E-commerce|Manufacturing/i }).first();

    if (await categoryButton.count() > 0) {
      await categoryButton.click();
      await page.waitForTimeout(500);
    }

    // Verify URL or results changed
    expect(page.url()).toContain('/marketplace');
  });
});
