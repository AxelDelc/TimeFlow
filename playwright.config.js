const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    globalSetup: './tests/seed-test.js',
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:3000',
    },
    webServer: {
        command: 'node src/server.js',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
    },
});
