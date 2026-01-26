import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Explicitly type plugins array or cast to any[] to allow push
  const plugins: any[] = [
    react(),
    tailwindcss(),
  ];

  // ONLY use the SSL plugin when running locally (npm run dev)
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
