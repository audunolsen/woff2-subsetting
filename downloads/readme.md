This is the download directory where fonts assets are written to.

A successfull run will output the following font files in the following format:
`<lowercase-kebab-case-font-family-name>-<weight-number>-<italic|nornal>-<subset-name>.woff2>`
Example:
`eb-garamond-400-italic-latin-ext.woff2`

It will also output a single stylesheet file along with the font and all of its variations/sebsets
that describe all of the font-face rules named `fonts.css`.

The files from a successful run are stored in a sub-directory inside this dir named w/ the date & time of the run.



