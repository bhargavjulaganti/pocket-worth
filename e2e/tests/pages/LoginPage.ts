import { expect, Locator, type Page } from "@playwright/test";
import { Playwrite_DE_LA_Guides } from "next/font/google";

export class Loginpage {
    readonly page: Page;
    readonly emailAddress: Locator;
    readonly password: Locator;
    readonly signInButton: Locator;
    readonly errorMessage: Locator;
    readonly validEmailAddressErrorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailAddress = page.getByRole('textbox', { name: 'Email address' });
        this.password = page.getByRole('textbox', { name: 'Password' });
        this.signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
        this.errorMessage = page.getByText('/auth\/invalid-email/');
        this.validEmailAddressErrorMessage = page.locator("#email-error");
    }

    async signIn(uname: string, pwd: string) {
        await this.enterUserName(uname);
        await this.password.fill(pwd);
        await this.signInButton.click();
    }

    async validateEmailAddressErrorMessage() {
        await expect(this.validEmailAddressErrorMessage).toContainText("Enter a valid email address")
    }

    async enterUserName(uname: string) {
        await this.emailAddress.fill(uname);
    }
}