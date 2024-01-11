interface ImportMetaEnv {
  /**
   * Link to stylesheet describing font-faces produced by Google Fonts
   * [See readme on how to get such link](../readme.md)
   */
  readonly VITE_GOOGLE_FONT_FACE_CSS_URL: string

  /**
   * Base path prepended to font-face stylesheet's src descriptor
   */
  readonly VITE_FONT_FACE_BASE_DIR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}