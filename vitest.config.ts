import { defineConfig } from 'vitest/config';
import tsconfigPaths from "vite-tsconfig-paths";
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))


export default defineConfig({ 
  root: '.',
  esbuild: {
    tsconfigRaw: '{}',
  },
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    workspace: [
      'vitest.config.ts',
      {
        extends: 'vite.config.ts',
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
          tsconfigPaths()
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ]
  },
});
