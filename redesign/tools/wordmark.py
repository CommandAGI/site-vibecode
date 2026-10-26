# The wordmark and the mark, drawn from the two faces' outlines (redesign/DESIGN.md § wordmark): "Vibe" in EB Garamond
# Italic, "Code" in Commit Mono, set on one baseline with our own spacing. Run on the build machine:
#   python redesign/tools/wordmark.py <EBGaramond-Italic[wght].ttf> <CommitMono-VF.ttf> <out dir>
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ital, mono, out = sys.argv[1:4]
serif = instantiateVariableFont(TTFont(ital), {'wght': 560})
code = instantiateVariableFont(TTFont(mono), {'wght': 430, 'ital': 0})

def run(font, text, x, scale, track):
    """Outline `text` from `font` starting at x, every advance plus `track` (our kerning), y up = baseline 0."""
    gs, cmap, hm = font.getGlyphSet(), font.getBestCmap(), font['hmtx']
    parts = []
    for ch in text:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
        parts.append(pen.getCommands())
        x += hm[g][0] * scale + track.get(ch, 0)
    return ' '.join(parts), x

S = 0.064  # 64 px per 1000 units
vibe, x = run(serif, 'Vibe', 0, S, {'V': -6.5, 'i': -0.6, 'b': -1.2, 'e': 0})
codeword, end = run(code, 'Code', x + 5, S * 0.74, {'C': -1.4, 'o': -1.4, 'd': -1.4})
W, top, base = round(end + 2), 46, 50
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -{top} {W + 4} {top + 16}" width="{W + 4}" height="{top + 16}" role="img" aria-labelledby="t"><title id="t">VibeCode</title>
<g id="w"><path fill="#e6fb65" d="M{x + 1:.1f} -27.5 L{end + 3:.1f} -29 L{end + 2:.1f} -3 L{x + 2:.1f} -1.5 Z"/>
<path fill="currentColor" d="{vibe}"/><path fill="#191919" d="{codeword}"/></g></svg>
'''
open(f'{out}/wordmark.svg', 'w').write(svg)

# The mark: an italic v whose last stroke runs into a mono caret, on the highlighter.
v, vx = run(serif, 'v', 0, 0.05, {})
caret, cx = run(code, '_', vx - 6, 0.05, {})
mark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><title>VibeCode</title>
<rect width="64" height="64" fill="#191919"/><rect x="0" y="26" width="64" height="20" fill="#e6fb65"/>
<g transform="translate(14 44)"><path fill="#fdfdfb" d="{v}"/><path fill="#2847f4" d="{caret}" transform="translate(0 -2)"/></g></svg>
'''
open(f'{out}/mark.svg', 'w').write(mark)
print('wordmark', W, 'mark ok')
