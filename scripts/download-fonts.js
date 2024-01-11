import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';

const googleFontsUrl = process.argv.at(2)

const vitePreviewServer = spawn('vite', ['--port', '8080'], {
  stdio: 'inherit',
  env: Object.assign(process.env, {
    VITE_GOOGLE_FONT_FACE_CSS_URL: googleFontsUrl
  })
});

process.on('uncaughtException', (err) => {
  vitePreviewServer.kill()

  console.error('FONT DOWNLOAD FAILED', err.message);
  process.exit(1);
});

vitePreviewServer.on('close', (code) => {
  throw new Error(`Vite server closed on its own. Code:${code}`)
})

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('http://localhost:8080/');

page.on('response', async (response) => {
  const request = response.request()
  const url = new URL(request.url())
  const type = response.headers()['content-type']

  if (type !== 'font/woff2') return
  if (!url.toString().startsWith('https://fonts.gstatic.com')) return

  const buffer = await response.buffer();
  const family = url.searchParams.get('family')
  const weight = url.searchParams.get('weight')
  const style = url.searchParams.get('style')
  const subset = url.searchParams.get('subset')
  const filename = `${family.toLowerCase().split(' ').join('-')}-${weight}-${style}-${subset}.woff2`

  await fs.writeFile(`downloads/${filename}`, buffer)

  console.log(`Successfully downloaded font ${filename}`)
})