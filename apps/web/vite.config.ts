import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fashion-studio/garment-schema': path.resolve(__dirname, '../../packages/garment-schema/src'),
      '@fashion-studio/editor-core': path.resolve(__dirname, '../../packages/editor-core/src'),
      '@fashion-studio/material-engine': path.resolve(__dirname, '../../packages/material-engine/src'),
      '@fashion-studio/artwork-engine': path.resolve(__dirname, '../../packages/artwork-engine/src'),
      '@fashion-studio/garment-engine': path.resolve(__dirname, '../../packages/garment-engine/src'),
      '@fashion-studio/renderer-3d': path.resolve(__dirname, '../../packages/renderer-3d/src'),
      '@fashion-studio/pattern-engine': path.resolve(__dirname, '../../packages/pattern-engine/src'),
      '@fashion-studio/simulation-adapter': path.resolve(__dirname, '../../packages/simulation-adapter/src'),
      '@fashion-studio/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@fashion-studio/export-engine': path.resolve(__dirname, '../../packages/export-engine/src'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
