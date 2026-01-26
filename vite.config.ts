import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const plugins = [
    react(),
    tailwindcss(),
  ];

  // ONLY use the SSL plugin when running locally (npm run dev)
  // Vercel provides its own HTTPS, so we don't need this in production.
  if (command === 'serve') {
    plugins.push(basicSsl());
  }

  return {
    plugins,
    server: {
      host: true, 
    }
  }
})