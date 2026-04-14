import { test, expect } from '@playwright/test';

test('has title and login page renders', async ({ page }) => {
  // Go to the app root, which should redirect to /login if not authenticated
  await page.goto('/');

  // Check if title is correct
  await expect(page).toHaveTitle(/Sport Amigo/);

  // Check if it redirected to the login page by verifying URL or text
  await expect(page).toHaveURL(/.*login/);
  
  // Verify main login elements are visible
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
});
