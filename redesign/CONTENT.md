# VibeCode: the audit (2026-10-26)

What the site was before the 2027 redesign, and what the redesign must keep. Brief: CommandAGI's
`docs/design/startup-redesign-2027.md`.

## routes

| route | what | kept |
|---|---|---|
| `/` | the landing page, English | yes, redesigned |
| `/es/` | the same page in Spanish | yes, redesigned, same sections |
| `/zh-Hans/` | the same page in Chinese | yes, redesigned, same sections |
| `mailto:hello@vibecode.ooo` | the only contact; the Team and Enterprise asks carry a subject | yes |

There is no sign-in, no form that posts and no payment on the site.

## the working feature: the demo

- `app/recipes.mjs` writes a whole program (one HTML document, a canvas and its script) from a sentence. It picks one
  of six recipes by the words (English, Spanish, Chinese) and falls back to drawing the visitor's own words.
- `app/demo.js` fills the code box, runs the program in `<iframe sandbox="allow-scripts">` (no network, no access to
  the page), and has Copy, Run, Reset, six example chips, Ctrl/⌘+Enter and a live status line.
- Found in the audit: the bar chart recipe read `DESCRIPTION`, which only the fallback declared, so "a bar chart of …"
  drew nothing (a ReferenceError in the frame). Fixed, with a test that runs every program's first frames
  (`tests/recipes.test.mjs`).

## claims, and how the page holds them

| claim | true? | how the redesign says it |
|---|---|---|
| a sentence becomes a program you can read, change and run | yes, from six recipes and a fallback | the demo, with the recipe note beside it |
| the page calls no model | yes | said in the hero's fine print, beside the demo and in the notes |
| nothing leaves the page | yes: no request after load; the frame is sandboxed | the sandbox section |
| the product's next version calls a model through CommandAGI's API | an intention | said as an intention, in the notes |
| Team and Enterprise | not priced, not launched | "priced at launch", mail links only; a line says no price is set and nothing takes a payment |

No testimonial, logo, user count, rating or press existed, and none is added. The compile sequence of the signature
section is a scripted illustration of one fixed program and is labeled so. The video is generated (fal) material
study of type, paper and ink, captioned as generated.

## sections, before → after

| before | after |
|---|---|
| nav bar: Demo, How it works, Pricing, Questions, Try it | an editor's line-number gutter (desktop) and a status-bar button with a popover (phone) |
| centered hero, two buttons | a split hero: the serif sentence and the mono line over a generated type-case loop |
| demo grid | the desk: a manuscript (the sentence) beside a galley (the code) and the frame |
| four feature cards | removed: their four facts moved into the compile section, the reading plate, the sandbox plate and the notes |
| how it works, three steps | three proofs: Describe, Read, Run and change, one plate each |
| pricing cards | a type specimen: Free, Team and Enterprise as three weights |
| FAQ | numbered notes |
| footer | a colophon |
