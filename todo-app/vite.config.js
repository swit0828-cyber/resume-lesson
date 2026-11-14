import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// 로컬 dev 서버에서도 /guide, /slides 처럼 확장자 없이 열리게 (배포는 vercel.json cleanUrls)
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query] = req.url.split('?')
      if (['/guide', '/slides', '/teacher', '/check'].includes(path)) {
        req.url = `${path}.html${query ? `?${query}` : ''}`
      }
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), cleanUrls],
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
