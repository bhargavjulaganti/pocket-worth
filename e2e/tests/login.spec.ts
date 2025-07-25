import { test, expect } from '@playwright/test';
import { Loginpage } from './pages/LoginPage';


test('has title', async ({ page }) => {
  await page.goto('https://pocket-worth.web.app/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Pocket Worth/);

});


test('validate e-mail address error message', async ({ page }) => {

  await page.goto('https://pocket-worth.web.app/');

  const loginPage = new Loginpage(page);
  await loginPage.enterUserName("abc");
  await loginPage.validateEmailAddressErrorMessage();
});