import './style.css'
import { getFontFaces } from './get-font-faces'

getFontFaces().then(res => {
  console.log('res', res)

  document.head.innerHTML += `\n<style>\n${res.cssDocString}\n</style>`
  const app = document.querySelector<HTMLDivElement>('#app')!

  for (const meta of res.fontFacesMeta)
    app.innerHTML += `
      <div style="font-family: ${meta.family}, Mark Unmatched; font-style: ${meta.style}; font-weight: ${meta.weight};">
        <h1>${meta.family}, ${meta.subset}, ${meta.style}, ${meta.weight}</h1>
        <br />
        ${meta.targetedSymbols.join(', ')}
      </div>
      <br />
      <br />
    `
}).catch((e: Error) => {
  import.meta.hot?.send('get-fonts-failure', e.message)
})
