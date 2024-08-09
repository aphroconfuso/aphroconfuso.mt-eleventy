import { test, expect } from '@playwright/test';

const domain = 'http://localhost:8080';

test('sequence visual test', async ({page}) => {
  await page.goto(`${ domain }/omar-nshea-bur-mg%C4%A7e%C5%BC/`);
  await expect(page).toHaveScreenshot();
});
