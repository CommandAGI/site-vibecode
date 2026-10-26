# VibeCode redesign: notes

## generated media (fal)

Made by `redesign/fal.mjs` on the build machine (`COMMANDAGI_ENV_ROOT=<checkout> node redesign/fal.mjs stills|videos
[name …]`), the key read from the env cascade (`SVC__FAL__MAIN__API_KEY`), never printed and never shipped. The
full-size sources stay on the build machine (`.gitignore`); every call is a line of `redesign/media/log.jsonl`. Costs are
estimated from fal's list prices on 2026-10-26: $0.06 per image (FLUX1.1 [pro] ultra), $0.056 per second (Kling 2.1 standard,
image to video).

LOOK, the end of every still's prompt: "high-key north window daylight, crisp macro photograph, shallow depth of field, clean white paper, cool neutral tones, editorial still life, no people, no hands, no faces, no screens, no legible words, no logos".

| scene | model | shape | prompt | cost |
|---|---|---|---|---|
| sorts | `fal-ai/flux-pro/v1.1-ultra` | 16:9 | Extreme macro of lead letterpress type sorts set in a row inside a steel composing stick, the mirrored letter faces catching the light, spacers and quads between words, LOOK | $0.06 |
| proof | `fal-ai/flux-pro/v1.1-ultra` | 16:9 | Overhead view of a printed proof sheet of a typeset page lying on a white table, dense lines of small serif type out of focus, one line swiped with a chartreuse yellow-green highlighter and a few ultramarine blue pencil proofreading marks in the margin, a blue pencil resting beside it, LOOK | $0.06 |
| ink | `fal-ai/flux-pro/v1.1-ultra` | 16:9 | Top-down macro of a drop of deep ultramarine blue ink spreading into the fibers of thick white cotton paper, feathered edges, tiny paper fibers visible, LOOK | $0.06 |
| stick | `fal-ai/flux-pro/v1.1-ultra` | 9:16 | Vertical macro of a wooden type case drawer with small compartments of lead type sorts, one compartment empty, soft daylight, LOOK | $0.06 |
| ink | `fal-ai/flux-pro/v1.1-ultra` | 16:9 | Seen from directly above, a flat uncut sheet of thick white watercolor paper filling the whole frame, a single large blot of deep ultramarine blue ink soaking into it in the middle, soft feathered bleeding edges, fine paper texture, LOOK | $0.06 |
| proof | `fal-ai/kling-video/v2.1/standard/image-to-video` | 5 s from proof.png | static overhead camera, soft daylight slowly drifts across the paper, a faint shadow of a window frame passes, very subtle | $0.28 |
| ink | `fal-ai/kling-video/v2.1/standard/image-to-video` | 5 s from ink.png | static camera, the ink slowly blooms and spreads outward through the paper fibers, calm, continuous | $0.28 |
| sorts | `fal-ai/kling-video/v2.1/standard/image-to-video` | 5 s from sorts.png | very slow macro dolly along the line of type, gentle rack focus, static lighting, no new objects | $0.28 |
| **total** | | | | **$1.14** of the $15 allowed |

Two stills are not shipped: the first `ink` (the paper came out torn; prompted again) and `stick` (a type-case drawer,
made for a phone crop the design did not need).

## from the sources to the page

- `redesign/tools/encode.sh`: each clip graded (sorts: the ultramarine duotone #0e1650 → #fdfdfb; proof: cooler and a
  little less saturated; ink: as made), played forward then back (a 10 s loop with no seam), 1280 px, AV1 WebM
  (CRF 42) and H.264 MP4 (CRF 29), and a 1600 px JPEG poster; AVIF posters from the JPEGs (Pillow, quality 55).
  Sizes: sorts 204 KB / 436 KB, proof 338 KB / 665 KB, ink 66 KB / 129 KB (WebM / MP4).
- `redesign/tools/wordmark.py`: the wordmark and the mark from the fonts' outlines.
- `redesign/tools/og.py`: `og.png` (1200×630, from `redesign/og.html`) and `touch-icon.png` (180×180, from `mark.svg`).
- `redesign/tools/locales.py`: `es/` and `zh-Hans/` from `index.html` (a table of every English segment; a segment
  that is not found stops the build).
- `redesign/tools/shots.py`: the screenshots at 1440, 768, 390, 320, 390 with reduced motion and 1440 dark, with page
  errors, sideways scroll and broken images reported.

## fonts

EB Garamond (Georg Duffner, Octavio Pardo; OFL) roman and italic, variable wght 400–800, from google/fonts; Commit
Mono 1.143 (Eigil Nikolajsen; OFL), variable wght 200–700 and ital, from its repository's `src/fonts/fontlab`. Subset
with `pyftsubset` to Latin, Latin-1 and the page's punctuation and arrows, WOFF2: 66 + 70 + 34 KB. Licences in `fonts/`.

## self-review (redesign/shots, 2026-10-26)

Scores 1–10 by the brief's six measures, from the screenshots at every width:

| measure | score | why |
|---|---|---|
| art direction | 8 | serif/mono as the whole idea; duotone film; no box anywhere |
| brand specificity | 9 | the wordmark, the gutter nav, the highlighter swipe and the type-weight pricing belong to no other site of the set |
| product expression | 8 | the compile section shows the product's idea; the real demo is the second thing you can touch |
| interaction | 8 | scroll writes the code; phrases are buttons; the demo runs; the phone gets a status-bar nav |
| technical quality | 8 | no JS framework, ~9 KB of page script, video lazy and posters first, reduced motion designed, fonts subset |
| craft | 8 | metric fallbacks, balanced headings, real quotes, measured contrast; the Chinese page falls back to the system serif |

Average 8.2, none below 8.

Screenshots of the review (2026-10-26) are in `redesign/screens/` (made by `redesign/tools/shots.py`).
