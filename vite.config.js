import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 로컬 네트워크(동일 Wi-Fi) 내 외부 기기(스마트폰 등) 접속 허용
    port: 5173,
  },
})
