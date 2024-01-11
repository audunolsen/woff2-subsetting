import { defineConfig } from 'vite'

const googleFontTestFallback = "https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
const googleFontUrl = process.env.VITE_GOOGLE_FONT_FACE_CSS_URL || googleFontTestFallback

console.log('Selected font:', googleFontUrl, '\n')

export default defineConfig({
  define: {
    'import.meta.env.VITE_GOOGLE_FONT_FACE_CSS_URL': `"${googleFontUrl}"`
  },
  plugins: [
    {
      name: 'Handle-invalid-font-request',
      configureServer(server) {
        server.ws.on('get-fonts-failure', (message: string) => {
          console.log(message)
          server.close()
        })
      },
    }
  ]
})