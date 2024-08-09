import { test, expect } from '@playwright/test';

const domain = 'http://localhost:8080';

test('story visual test 1', async ({page}) => {
  await page.goto(`${ domain }/jimmy-grima-splu%C5%BCjonijiet-1-il-kwiet-u-l-lejl/`);
  await expect(page).toHaveScreenshot();
});

test('story visual test 2', async ({page}) => {
  await page.goto(`${ domain }/davinia-hamilton-%C5%BCerrieg%C4%A7a/`);
  await expect(page).toHaveScreenshot();
});

test('story visual test 3', async ({page}) => {
  await page.goto(`${ domain }/noah-fabri-insalata/`);
  await expect(page).toHaveScreenshot();
});

test('story visual test 4', async ({page}) => {
  await page.goto(`${ domain }/charlene-galea-%C4%A1ismi-battikata/`);
  await expect(page).toHaveScreenshot();
});

test('story visual test 5', async ({page}) => {
  await page.goto(`${ domain }/miriam-galea-lejl-u-nhar/`);
  await expect(page).toHaveScreenshot();
});

test('story visual test 6', async ({page}) => {
  await page.goto(`${ domain }/leslie-vassallo-mar%C4%8B-maqbu%C5%BC/`);
  await expect(page).toHaveScreenshot();
});
