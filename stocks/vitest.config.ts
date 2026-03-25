import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    hookTimeout: 60000,
    env: {
      DATABASE_URL: 'postgres://postgres:postgres@0.0.0.0:5432/test_db',
      NODE_ENV: 'test',
    },
  },
});
