import { defineConfig } from 'vite';
import { mockForge } from 'mockfoge/vite-plugin';

export default defineConfig({
  plugins: [mockForge()],
});