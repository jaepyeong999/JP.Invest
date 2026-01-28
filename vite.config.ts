
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel에서 설정한 API_KEY를 브라우저 전역 변수로 치환
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': '({})'
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
