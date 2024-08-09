import { test, expect } from '@playwright/test';

const domain = 'http://localhost:8080';

test('generic visual test', async ({page}) => {
  await page.goto(`${ domain }/dwarna/`);
  await expect(page).toHaveScreenshot();
});

test('diary visual test', async ({page}) => {
  await page.goto(`${ domain }/warren-bartolo-djarju-2024-06-02-mo%C4%A7%C4%A7i-huwa-ffukat-li-nitlaq-daqt/`);
  await expect(page).toHaveScreenshot();
});
