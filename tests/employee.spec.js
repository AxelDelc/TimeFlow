import { test, expect } from '@playwright/test';

test.describe('Employee access security', () => {
  test('if not logged in then redirected to /login', async ({ page }) => {
    await page.goto('http://localhost:3000/employee');
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});

test.describe('Employee dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecte avec le compte salarié de test avant chaque test
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-employee@test.dev');
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill('test123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL('http://localhost:3000/employee');
  });

  test('if logged in as employee then accesses dashboard', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:3000/employee');
  });

  test('punch in and punch out buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Pointer entrée' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pointer sortie' })).toBeVisible();
  });

  test('timeclock history table is visible', async ({ page }) => {
    await expect(page.getByText('Mes pointages')).toBeVisible();
  });
});
