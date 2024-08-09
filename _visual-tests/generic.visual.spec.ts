import { test, expect } from '@playwright/test';

const domain = 'http://localhost:8080';

test('generic page visual test', async ({page}) => {
  await page.goto(`${ domain }/dwarna/`);
  await expect(page).toHaveScreenshot();
});
