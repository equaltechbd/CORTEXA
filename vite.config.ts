import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // This properly fills process.env with the API_KEY for usage in services/gemini.ts
      'process.env': {
        API_KEY: env.VITE_API_KEY || env.API_KEY || ''
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});