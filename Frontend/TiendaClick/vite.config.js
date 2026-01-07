import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setupTests.js"],
    css: true,

  }
})