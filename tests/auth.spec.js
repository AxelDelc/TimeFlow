import test, { expect, Page } from '@playwright/test';

test.describe("Authentication", () => {
    // Tests pour l'authentification
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:3000/");
    });

    test("should show log in button", async ({ page }) => {
        // Vérifie que le bouton de connexion est visible
        const signInButton = await page.getByRole('link', { name: 'Se connecter' });
        await expect(signInButton).toBeVisible();
    });

    test("should show error message if login fails with wrong email", async ({ page }) => {
        // Simule une tentative de connexion échouée avec mauvais email
        await page.getByRole('link', { name: 'Se connecter' }).click();
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('invalid@example.com');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('test123');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        const errorMessage = await page.getByText('Utilisateur non trouvé');
        await expect(errorMessage).toBeVisible();
    });

    test("should show error message if login fails with wrong password", async ({ page }) => {
        // Simule une tentative de connexion échouée avec mauvais mot de passe
        await page.getByRole('link', { name: 'Se connecter' }).click();
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-admin@test.dev');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('wrongpassword');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        const errorMessage = await page.getByText('Mot de passe incorrect');
        await expect(errorMessage).toBeVisible();
    });

    test("should log in successfully with correct credentials", async ({ page }) => {
        // Simule une tentative de connexion réussie 
        await page.getByRole('link', { name: 'Se connecter' }).click();
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-admin@test.dev');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('test123');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        await expect(page).toHaveURL('http://localhost:3000/admin');
    });

});