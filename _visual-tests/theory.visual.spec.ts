import { test, expect } from '@playwright/test';

const domain = 'http://localhost:8080';

test('theory visual', async ({page}) => {
  await page.goto(`${ domain }/il-kliem-fit-teorija-alterit%C3%A0/`);
  await expect(page).toHaveScreenshot();
});
