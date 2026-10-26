# site-vibecode

The site of VibeCode (vibecode.ooo), a company of CommandAGI: code by description. A sentence becomes a working program
you can read, change and run in the browser. A static folder served by CommandAGI's site hosting at
https://vibecode.commandagi.app, and the site of the org `org-vibecode`.

- `index.html`, `es/index.html`, `zh-Hans/index.html`: the landing page in English, Spanish and Chinese. The English
  page is the source; `redesign/tools/locales.py` writes the other two from it. The footer's A/文 button lists all three.
- `style.css`, `fonts/` (EB Garamond and Commit Mono, subset, OFL), `wordmark.svg`, `mark.svg`, `touch-icon.png`,
  `og.png`, `media/` (the generated loops and their posters): the 2027 design, `redesign/DESIGN.md`.
- `app/recipes.mjs`: the demo's engine. A description picks one recipe by its words, and the recipe writes a complete
  program: one HTML document with a canvas and its script.
- `app/demo.js`: the demo's script. It fills the code editor from the engine and runs the program in a sandboxed
  frame. The page sends nothing, and the frame has no network and no access to the page.
- `app/page.js`: the page's motion: the line-number gutter, the phone's status bar, the loops that play while seen,
  and the compile section that scroll writes into code. Without it the page is whole.
- `app/lang.js`: the language button, the mechanism of CommandAGI's public sites.
- `redesign/`: the audit (`CONTENT.md`), the design (`DESIGN.md`), the media log and self-review (`NOTES.md`), and the
  build machine's tools: `fal.mjs` (generated media), `tools/encode.sh`, `tools/wordmark.py`, `tools/og.py`,
  `tools/locales.py`, `tools/shots.py` (screenshots at 1440, 768, 390, 320, reduced motion and dark).
- `tests/recipes.test.mjs`: the site's own tests. `node --test tests/*.test.mjs`.

## the demo tells the truth

The first version does not call a model. It picks one of six recipes from the words of the description, and its
fallback draws the visitor's own words. The page says so, beside the demo and in the questions. The product's next
version calls a model through CommandAGI's API, never from a browser key.

## domains

`vibecode.ooo` is the primary domain and an alias of the primary address; `.ooo` is a generic TLD, so the locale is not
fixed by the domain. The locale pages are `/` (en), `/es/` and `/zh-Hans/`.

## tests

```
node --test tests/*.test.mjs
```

The browser half, its pages at 1440 and 390 px with no sideways scroll, no broken image and no page error, is
`tests/workbench/browser_org_sites.mjs` in the CommandAGI repository, which screenshots every org site.
