import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
checker({
typescript: true, // checks tsconfig at project root; add tsconfigPath if needed
// optional: eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' }
}),
  
  ],
});