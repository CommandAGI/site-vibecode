# og.png (1200×630) from redesign/og.html, and touch-icon.png (180×180) from mark.svg.
#   python redesign/tools/og.py   (from the site folder)
from pathlib import Path
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parents[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 630}, color_scheme='light')
    # The wordmark goes in inline: a page opened from a file may not reach another file through <use>.
    mark = (root / 'wordmark.svg').read_text().replace('<svg ', '<svg class="w" ', 1)
    html = (root / 'redesign/og.html').read_text().replace('<!--wordmark-->', mark)
    (root / 'redesign/og.rendered.html').write_text(html)
    pg.goto((root / 'redesign/og.rendered.html').as_uri()); pg.wait_for_timeout(800)
    (root / 'redesign/og.rendered.html').unlink()
    pg.screenshot(path=str(root / 'og.png'))
    pg = b.new_page(viewport={'width': 180, 'height': 180})
    pg.goto((root / 'mark.svg').as_uri())
    pg.evaluate("document.documentElement.setAttribute('width', 180), document.documentElement.setAttribute('height', 180)")
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(root / 'touch-icon.png'))
    b.close()
