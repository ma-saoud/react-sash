// Runs the demo in example/ with `npm run dev`, importing the package straight from src/.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

export default defineConfig({
  root: 'example',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react-sash$/, replacement: src('index.ts') },
      { find: /^react-sash\/styles\.css$/, replacement: src('styles.css') },
    ],
  },
});
