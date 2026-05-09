import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    loadEnv(mode, process.cwd(), '').GEMINI_API_KEY || 
    process.env.GEMINI_API_KEYS || 
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is managed by the platform
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
