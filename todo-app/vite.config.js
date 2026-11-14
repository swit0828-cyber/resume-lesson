import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        guide: resolve(__dirname, 'guide.html'), // 수강생 실습 안내 (.env · 프롬프트)
        teacher: resolve(__dirname, 'teacher.html'), // 강사용 진도 체크
        check: resolve(__dirname, 'check.html'), // 학생용 완료 버튼
      },
    },
  },
})
