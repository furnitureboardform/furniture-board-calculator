import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/furniture-board-calculator/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
