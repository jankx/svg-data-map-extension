import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react({ jsxRuntime: 'classic' }), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      manifest: true,
      sourcemap: true,
      minify: true,
      lib: {
        entry: path.resolve(__dirname, 'src/main.tsx'),
        name: 'SvgDataMap',
        formats: ['iife'] as any,
        fileName: () => `assets/index.js`,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          '@wordpress/blocks',
          '@wordpress/block-editor',
          '@wordpress/components',
          '@wordpress/data',
          '@wordpress/element',
          '@wordpress/i18n'
        ],
        output: {
          globals: {
            react: 'wp.element',
            'react-dom': 'wp.element',
            '@wordpress/blocks': 'wp.blocks',
            '@wordpress/block-editor': 'wp.blockEditor',
            '@wordpress/components': 'wp.components',
            '@wordpress/data': 'wp.data',
            '@wordpress/element': 'wp.element',
            '@wordpress/i18n': 'wp.i18n',
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
