import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const args = yargs(hideBin(process.argv))
  .option('local-base-dir', {
    alias: 'd',
    describe: 'Base-path in CSS\' src-descriptor'
  })
  .option('url', {
    alias: 'u',
    describe: 'The external stylesheet URL from google'
  })
  .demandOption(['u'], 'Please provide at least the URL to work with this tool')
  .parse()

const vitePreviewServer = spawn('vite', ['--port', '8080'], {
  stdio: 'inherit',
  env: Object.assign(process.env, {
    VITE_GOOGLE_FONT_FACE_CSS_URL: args.u,
    VITE_FONT_FACE_BASE_DIR: args.d ?? ''
  })
});

const dirname = `downloads/${createDirName()}`;
await fs.mkdir(dirname);

process.on('uncaughtException', async error => {
  vitePreviewServer.kill()
  await fs.rm(dirname, { recursive: true, force:true })

  console.error('FONT DOWNLOAD FAILED', error.message);
  process.exit(1);
});

vitePreviewServer.on('close', code => {
  throw new Error(`Vite server closed on its own. Code:${code}`)
})

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('http://localhost:8080/');

page.on('console', async message => {
  const identifier = '/* font-face-local-assets-stylesheet */'
  const text = message.text()
  if (!text.startsWith(identifier)) return

  await fs.writeFile(`${dirname}/fonts.css`, text)
  console.log(`Successfully downloaded font-face stylesheet`)
})

page.on('response', async response => {
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

  await fs.writeFile(`${dirname}/${filename}`, buffer)
  console.log(`Successfully downloaded font ${filename}`)
})

function createDirName() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear().toString().substring(2);
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${day}.${month}.${year}-${hour}:${minute}:${second}`
}