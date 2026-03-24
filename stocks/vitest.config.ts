import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    env: {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/test_db', // Placeholder to satisfy Zod
    },
    alias: {
      'db/': path.resolve(__dirname, './src/db/'),
      'services/': path.resolve(__dirname, './src/services/'),
    },
  },
});
