## What does this acheive??

It's similiar to [font-ranger](https://www.npmjs.com/package/font-ranger?activeTab=readme); it splits the desired font into subsets for faster loading. [See google fonts' knowlegde base for a short brief on subsetting](https://fonts.google.com/knowledge/glossary/subsetting).

## What are the obstacles??

[Google Fonts](https://fonts.google.com/) Is the best provider of highly optimized `woff2` fonts split into subsets for different languages and/or scripts. The problem is that if you are looking to host your fonts on your own, it is a MASSIVELY grindy task to optimize the fonts and manage the subsets of the fonts yourself. Unfortunately, Google only lets you download THE entirety of the font in a subpar format (`ttf`). If you want the benefits of `woff2` and type subsets, you need to use their CDN.

## How does it work??

This spins up a webapp in headless browser through [Puppeteer](https://pptr.dev/) to intercept
the font request responses and write the font-assets to the file system, essentially downloading them.

Google utilises the [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range) descriptor of the CSS font-face rule. Google will only load parts of the font where the webpage contents include a unicode symbol that matches the specified unicode-range.

The clever part of this webapp is that it parses the font-face rules returned by google and outputs to the webapp all the found unicode-ranges to spawn *all* the possible requests for a font. Because google's font asset CDN links are cryptic and not unique for each subset, there's some content negotiation between the client ann cdn that determine what variation of the font the client is requesting, to better identify what font is requested, the client-app also assigns some URL params to the font-requests for easier handling in the download-phase.

## How to use??

Run `$ npm run fonts:download -- -u <google-font-face-styles-url>`.

The command requires an URL argument (`--url` or `-u`) pointing to a font-face stylesheet produced by Google Fonts. The font face stylesheet url can be found when browsing and selecting fonts on Google Fonts.

Example of stylesheet link on Google Fonts
![image info](./ga-font-source-example.png)

See [package.json](./package.json) for some font download presets/examples.

You can also pass `--local-base-dir` or `-d` argument to prepend to the local paths of the downloaded font-face stylesheet.

## Misc notes

- The duration of the font-downloading is very variable depending on the quantity of fonts, I don't care to track the progress to make the script exit on its own. Just keep an eye on the terminal output/file system and terminate the script yourself when happy with the results. The silver lining here it that you can open the webapp and preview the fonts and all their variants in the webapp.

- This app is very brittle and probably very prone to breaking should google structure their response data differently. This was last successfylly tested in Jan 2024.

## Todos

- ~~Shold probably keep the unicode ranges and download them as well, or maybe just write an updated css document
with the updates font-face rules~~ ✅

- Expose bin and publish as package, right now this has to be cloned and run from cli inside project dir 

- Output some JSON meta
- Split font-face files based on family for narrowed choosing of wanted fonts from a greater selection

### Additional resources

- [Optimize web fonts (web.dev)](https://web.dev/learn/performance/optimize-web-fonts)


