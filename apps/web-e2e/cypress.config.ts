import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      "cypressDir": "src",
      "webServerCommands": {
        "default": "npx nx run @or-smart-analytics/web:dev"
      },
      "ciWebServerCommand": "npx nx run @or-smart-analytics/web:start",
      "ciBaseUrl": "http://localhost:3000"
    }),
    baseUrl: 'http://127.0.0.1:3000'
  }
});
