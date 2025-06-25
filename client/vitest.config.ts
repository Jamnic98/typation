import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin'

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: '.',
  esbuild: {
    tsconfigRaw: '{}',
  },
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [
      'node_modules/**',  // exclude node_modules explicitly
      'e2e/**',           // your e2e folder, if you want
      '**/*.spec.ts',     // or any other patterns
    ],
    workspace: [
      'vitest.config.ts',
      {
        extends: 'vite.config.ts',
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
          tsconfigPaths(),
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
    ],
  },
})


// import { defineConfig } from 'vitest/config'
// import react from '@vitejs/plugin-react'
// import tsconfigPaths from 'vite-tsconfig-paths'
// import tailwindcss from '@tailwindcss/vite'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin'

// const dirname =
//   typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// export default defineConfig({
//   root: '.',
//   esbuild: {
//     tsconfigRaw: '{}',
//   },
//   plugins: [react(), tsconfigPaths(), tailwindcss()],
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: './src/setupTests.ts',
//     exclude: ['e2e/**', '**/*.spec.ts'],  // Add this line to exclude E2E tests
//     workspace: [
//       'vitest.config.ts',
//       {
//         extends: 'vite.config.ts',
//         plugins: [
//           storybookTest({ configDir: path.join(dirname, '.storybook') }),
//           tsconfigPaths(),
//         ],
//         test: {
//           name: 'storybook',
//           browser: {
//             enabled: true,
//             headless: true,
//             provider: 'playwright',
//             instances: [{ browser: 'chromium' }],
//           },
//           setupFiles: ['.storybook/vitest.setup.ts'],
//         },
//       },
//     ],
//   },
// })

