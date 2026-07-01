import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The portfolio is a GitHub Pages *project* site served at /riddhi/.
// This app is built to a repo-root folder `margin-calculator/` and served at
// https://riddhi-k-bhargava.github.io/riddhi/margin-calculator/
export default defineConfig({
  plugins: [react()],
  base: '/riddhi/margin-calculator/',
  build: {
    outDir: '../../margin-calculator',
    emptyOutDir: true,
  },
})
