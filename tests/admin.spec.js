import test, { expect, Page} from '@playwright/test';

test.describe('Admin Page', () => {

    // Tests pour la page d'administration
    test.beforeEach(async ({ page }) => {
        // Se connecte en tant qu'administrateur avant chaque test
        await page.goto("http://localhost:3000/");
        await page.getByRole('link', { name: 'Se connecter' }).click();
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-admin@test.dev');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('test123');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        await page.goto('http://localhost:3000/admin');
    });

    test("Should display stats on admin dashboard", async ({ page }) => {
        // Vérifie que les statistiques sont affichées sur le tableau de bord admin
        await expect(page.getByText('Salariés total')).toBeVisible();
        await expect(page.getByText('Comptes actifs')).toBeVisible();
        await expect(page.getByText('Pointages aujourd\'hui')).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^Présents maintenant$/ })).toBeVisible();

    });

    test("Should be able to create a new employee", async ({ page }) => {
        // Simule la création d'un nouvel employé
        await page.getByRole('link', { name: 'Salariés' }).click();
        await page.goto('http://localhost:3000/admin/employees');
        await page.getByRole('link', { name: 'Ajouter un salarié' }).click();
        await page.goto('http://localhost:3000/admin/employees/new');
        await page.getByRole('textbox', { name: 'Nom complet' }).fill('Test Name Employee');
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-email@employee.com');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('testMdp');
        await page.getByRole('button', { name: 'Créer le compte' }).click();
        await page.goto('http://localhost:3000/admin/employees');
        const newEmployee = await page.getByText('T Test Name Employee');
        await expect(newEmployee).toBeVisible();
    });

    test("Can't create employee with existing email", async ({ page }) => {
        // Simule une tentative de création d'un employé avec un email déjà utilisé
        await page.getByRole('link', { name: 'Salariés' }).click();
        await page.goto('http://localhost:3000/admin/employees');
        await page.getByRole('link', { name: 'Ajouter un salarié' }).click();
        await page.goto('http://localhost:3000/admin/employees/new');
        await page.getByRole('textbox', { name: 'Nom complet' }).fill('Test Name Employee');
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-admin@test.dev');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('testMdp');
        await page.getByRole('button', { name: 'Créer le compte' }).click();
        const errorMessage = await page.getByText('Cette adresse email est déjà utilisée.');
        await expect(errorMessage).toBeVisible();
    });
});

test.describe('Security', () => {
    // Tests pour la sécurité de l'application
    test("if disconnected, can't access admin panel", async ({ page }) => {
        await page.goto("http://localhost:3000/admin");
        await expect(page.getByText('Accès refusé')).toBeVisible();
    });

    test("If a employee is logged in, can't access admin panel", async ({ page }) => {
        // Se connecte avec le compte salarié de test
        await page.goto("http://localhost:3000/login");
        await page.getByRole('textbox', { name: 'Adresse email' }).fill('test-employee@test.dev');
        await page.getByRole('textbox', { name: 'Mot de passe' }).fill('test123');
        await page.getByRole('button', { name: 'Se connecter' }).click();
        await page.goto("http://localhost:3000/admin");
        await expect(page.getByText('Accès refusé')).toBeVisible();
    });
});
