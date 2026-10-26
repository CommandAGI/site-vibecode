# VibeCode: the design (2027)

The designer: a type designer who now makes developer tools. The brief's row: "human language and code are two
typefaces; serif becomes mono". Light, with a designed dark. EB Garamond (italic for what a person says) and Commit
Mono (what the machine runs, also huge in headlines). White #fdfdfb, black #191919, chartreuse highlighter #e6fb65,
ultramarine #2847f4.

## concept

A proof sheet on a type designer's desk. What you say is set in Garamond; what runs is set in Commit Mono; the
highlighter links a phrase to the lines it became. Every section is one plate that says one thing. The page is
material (lead type, paper, ink) and type, not boxes.

## type

- Text: EB Garamond (variable, wght 400–800), 1.25 rem (20 px) body, old-style numerals (`onum`), real quotes and
  dashes, `text-wrap: pretty`. Italic = the person's voice: sentences, prompts, examples.
- Code and headlines: Commit Mono (variable, wght 200–700, ital 0–1). In running text set at 0.8 em so its x-height
  (540/1000) meets Garamond's (400/1000 × 1.25 em). The hero's mono line animates its weight 200 → 640 once, as a
  program "sets".
- Scale: a perfect fifth (1.5) from 1.25 rem: 1.25 · 1.875 · 2.8 · 4.2 · 6.3 rem; display sizes fluid with `clamp()`
  in `vw`. Headings `text-wrap: balance`.
- Small caps (`smcp`) for labels in Garamond; figure captions in mono 0.75 rem, upper and lower case.
- Fallbacks metric-matched: Garamond → Times New Roman at `size-adjust: 89%`; Commit Mono → Courier New at 100% with
  matched ascent. Chinese falls to the system's Song/Ming serif.

## color (OKLCH, sRGB fallbacks first)

| token | light | dark | use |
|---|---|---|---|
| paper | oklch(99.3% 0.003 106) #fdfdfb | oklch(17% 0.004 265) #121315 | ground |
| ink | oklch(21.8% 0 0) #191919 | oklch(94% 0.008 100) #eeeee6 | text, rules |
| quiet | oklch(46% 0 0) #5c5c5c | oklch(74% 0.006 100) #b3b3ac | captions |
| hl | oklch(95% 0.18 117) #e6fb65 | same | highlighter: links phrase ↔ code, buttons |
| blue | oklch(51.5% 0.25 266) #2847f4 | oklch(72% 0.15 266) #7d93ff | links, focus, the cursor |

Measured contrast (WCAG): ink on paper 17.1:1; quiet on paper 6.6:1; blue on paper 6.3:1; ink on hl 15.9:1; dark:
ink on paper 16.7:1, quiet 9.0:1, blue 6.7:1. Text is never set on the highlighter in anything but ink.

## layout

- 1440 and 2560: a 12-column grid, 56 px gutter column at the left edge holding the line-number nav; content max
  1680 px; plates full bleed.
- 768: the gutter stays (40 px); two-column plates stack where a column would fall under 320 px.
- 390: one column; the gutter becomes the status bar: a fixed bottom-left button "Ln 3 · Demo" that opens a popover
  of the sections. The hero's video is a 4:3 plate under the headline; the compile section shows the sentence above the
  code, the canvas as a strip.
- 320: the same as 390 with the display sizes at their minimum (the mono line at 13 vw); no horizontal scroll; the code
  wraps (`white-space: pre-wrap`).

## shape language

Zero radius anywhere. One hairline (1 px ink) for rules, two for section ends. Buttons are highlighter swipes: a
chartreuse parallelogram (`clip-path`) behind ink text, never a rounded rectangle and never a shadow. Secondary
actions are words with an ultramarine underline. The code toolbar is bracketed mono words: `[copy] [run] [reset]`.
Focus: a 2 px ultramarine outline at 3 px offset with the highlighter behind it, the proofreader's mark.

## motion grammar: the highlighter sweep

Things arrive left to right as a highlighter is drawn: `clip-path: inset(0 100% 0 0)` → `inset(0)`, 420 ms,
`cubic-bezier(.2,.7,.1,1)`, never a bounce or a fade-up. Serif becomes mono by a sweep across the same line, never by
a morph of letterforms. Scroll drives the compile section (sticky) and the plates' sweeps (`animation-timeline:
view()` where the browser has it, in view otherwise). Video moves slowly (ping-pong loops, 10 s).

Reduced motion: no sticky scrolling; every compile step is shown at once with its links; the canvas shows one still
frame of the finished program; the videos never load (their posters stand); the hero's weight is set, not animated.
Nothing flashes.

## media (fal; prompts, models and costs in redesign/NOTES.md)

Material studies, never people, screens or fake products: lead sorts in a composing stick (hero), a proof sheet with
one highlighted line and blue pencil marks (the reading plate), ultramarine ink soaking into cotton paper (the
sandbox plate). The type case is graded to the ultramarine duotone (#0e1650 → #fdfdfb); the proof is cooled; the ink
is as made. Each loop plays forward and back (no seam), 1280 px, AV1 WebM + H.264 MP4, under 700 KB; posters AVIF +
JPEG. Each is captioned "fig. n — … generated (fal), not a photograph".

## the signature moment: a sentence compiles

"Draw a ball that falls, bounces off the floor, and leaves a trail." On scroll the sentence is highlighted phrase by
phrase; each phrase sweeps into its code lines (serif → mono) and the canvas beside them runs the program as far as it
is written. Each phrase is a button: focus or click it to see its lines. It is a scripted illustration of one fixed
program, labeled so; the working demo follows it.

## sections

1. The sentence (hero): "Say it in a sentence." / `run(it);`
2. Compile: the signature.
3. Read (full-bleed video): "Read every line."
4. The desk (the demo): the manuscript, the galley, the frame.
5. Three proofs: Describe, Read, Run and change.
6. The sandbox (full-bleed video): "Nothing leaves the page."
7. Specimen (pricing): three weights.
8. Notes (questions).
9. Colophon (footer) with the A/文 language button.

## don'ts

No cards, pills, rounded corners, shadows, gradients, glass or glow. No icon set: glyphs are type (“ ” { } ▸ ¶).
No sans-serif. No text on video without a solid ground. No claims beyond CONTENT.md.
