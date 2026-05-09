import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file if it exists, otherwise use process.env
  // In AI Studio, keys are often in process.env but not necessarily in .env files
  const env = loadEnv(mode, process.cwd(), '');
  
  // Try all possible env key names used in AI Studio
  const apiKey = 
    env.GEMINI_API_KEY || 
    process.env.GEMINI_API_KEY || 
    env.GEMINI_API_KEYS || 
    process.env.GEMINI_API_KEYS || 
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      // Also define versions with prefixes just in case the framework logic expects them
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
