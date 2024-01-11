export async function getFontFaces() {
  /**
   * This assumes the format:
   * 
   * ```
   * // script- or language-name
   * @font-face {
   *  // css-descriptors
   * }
   * 
   * // repeat…
   * ```
   * 
   * @note The comment header is slash followed by asterisk,
   * jsut replaced here to not break JSDOC
   */
  const res = await fetch(import.meta.env.VITE_GOOGLE_FONT_FACE_CSS_URL).then(res => res.text())

  // console.log('FONT', import.meta.env.VITE_GOOGLE_FONT_FACE_CSS_URL)

  /**
   * This matches the comment header and css font face rule for each subset
   */
  const fontfaces = [...res.matchAll(/\/\*.+?(?=\/\*|$)/gs)]
  const fontFacesMeta = fontfaces.map(([match]) => {

    let [subset, ...css] = match.split('\n')
    subset = subset.match(/(?<=\/\*\s).+(?=\s)/)?.[0] ?? ''

    const selector = css.join('\n').match(/{.+/s)?.[0] ?? ''
    const family = selector.match(/(?<=font-family:\s').+(?=';)/)?.[0] ?? ''
    const weight = selector.match(/(?<=font-weight:\s).+(?=;)/)?.[0] ?? ''
    const style = selector.match(/(?<=font-style:\s).+(?=;)/)?.[0] ?? ''
    const ranges = (selector.match(/(?<=unicode-range:\s).+(?=;)/)?.[0] ?? '').split(',').map(e => e.trim())
    const url = new URL(selector.match(/(?<=url\().+(?=\)\s)/)?.[0] ?? '')

    if (!url.toString().endsWith('.woff2')) {
      throw new Error('Parsed font face contains non woff2 font asset, we\'re only interested in optimizied woff2 fonts')
    }

    const targetedSymbols = ranges.map(parseRange).flat()
    console.log('selector', subset, targetedSymbols)


    /** Make URL request sent to ga more readable, useful when retieving the font asset */
    url.searchParams.append('family', family)
    url.searchParams.append('weight', weight)
    url.searchParams.append('style', style)
    url.searchParams.append('family', family)
    url.searchParams.append('subset', subset)

    const updatedCss = css.join('\n').replace(/(?<=url\().+(?=\)\s)/, url.toString())

    return {
      subset,
      family,
      style,
      weight,
      url,
      updatedCss,
      targetedSymbols
    }
  })

  const cssDocString = fontFacesMeta.map(e => e.updatedCss).join('\n')

  if (!fontFacesMeta.length || !cssDocString) {
    throw new Error('Could not retrieve any font data')
  }

  return { fontFacesMeta, cssDocString }
}

/**
  * U+26 — single code point
  * U+0-7F
  * U+0025-00FF — code point range
  * U+4?? — wildcard range
  * U+0025-00FF, U+4?? — multiple values
  */
function parseRange(range: string) {
  range = range.replace(/^U\+/, '')

  // Range of characters
  if (range.includes('-')) {
    const [start, end] = range.split('-').map(u => parseInt(u, 16));
    return [...Array(end + 1).keys()].slice(start).map(i => String.fromCodePoint(i))    
  }
  
  // Wildcard range
  if (range.includes('??')) {
    const base = parseInt(range.replace('??', '00'), 16);
    return [...Array(256).keys()].map(i => String.fromCodePoint(base + i))
  }

  // Single character
  return [String.fromCodePoint(parseInt(range, 16))];
}