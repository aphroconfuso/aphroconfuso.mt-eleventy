import { test, expect } from '@playwright/test';

const domain = 'http://localhost:8080';

test('contributors index visual test', async ({page}) => {
  await page.goto(`${ domain }/kontributuri/`);
  await expect(page).toHaveScreenshot();
});

test('contributor visual test', async ({page}) => {
  await page.goto(`${ domain }/simon-bartolo/`);
  await expect(page).toHaveScreenshot();
});
