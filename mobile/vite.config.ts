import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  return {
    root: __dirname,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'mobile-nonblocking-css',
        apply: 'build',
        transformIndexHtml(html) {
          return html.replace(
            /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
            `<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`,
          );
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'motion'],
      alias: {
        '@mobile': path.resolve(__dirname, '.'),
        '@frontend': path.resolve(__dirname, '../frontend'),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'motion/react': path.resolve(__dirname, 'node_modules/motion/dist/es/react.mjs'),
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:3000',
      },
      fs: {
        allow: [path.resolve(__dirname, '..')],
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      cssCodeSplit: true,
      modulePreload: false,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
            if (id.includes('node_modules/motion')) return 'motion-vendor';
            if (id.includes('node_modules/@google') || id.includes('node_modules/@supabase')) return 'data-vendor';
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
          },
        },
      },
    },
  };
});
