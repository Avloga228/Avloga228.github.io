import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  };

  // Додаємо проксі тільки в режимі розробки
  if (command === 'serve') {
    config.server = {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    };
  }

  return config;
});
