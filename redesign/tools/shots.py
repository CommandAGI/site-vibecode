# Screenshots of the site at 1440, 768, 390 and 320 px, and at 390 with reduced motion (redesign/DESIGN.md § layout).
#   python redesign/tools/shots.py <base url> <out dir> [page path]
# It also reports page errors, sideways scroll and broken images, the browser half of the site's checks.
import sys, json
from playwright.sync_api import sync_playwright

base, out = sys.argv[1], sys.argv[2]
page_path = sys.argv[3] if len(sys.argv) > 3 else ''
problems = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h, motion, scheme in [('1440', 1440, 900, 'no-preference', 'light'), ('768', 768, 1024, 'no-preference', 'light'),
                                       ('390', 390, 844, 'no-preference', 'light'), ('320', 320, 640, 'no-preference', 'light'),
                                       ('390-still', 390, 844, 'reduce', 'light'), ('1440-dark', 1440, 900, 'no-preference', 'dark')]:
        ctx = b.new_context(viewport={'width': w, 'height': h}, reduced_motion=motion, color_scheme=scheme, device_scale_factor=1)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(base + page_path, wait_until='networkidle')
        pg.wait_for_timeout(1800)
        tag = (page_path.strip('/').replace('/', '-') or 'en') + '-' + name
        pg.screenshot(path=f'{out}/{tag}-top.png')
        # Walk the page so the scroll-driven parts reach their state, then a full-page picture.
        total = pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, total, h // 2):
            pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(60)
        for frac in (0.25, 0.6, 0.95):
            pg.evaluate(f"(() => {{ const c = document.getElementById('compile'); scrollTo(0, c.offsetTop + (c.offsetHeight - innerHeight) * {frac}); }})()")
            pg.wait_for_timeout(700)
            pg.screenshot(path=f'{out}/{tag}-compile-{int(frac*100)}.png')
        pg.evaluate("document.getElementById('demo').scrollIntoView()"); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{out}/{tag}-demo.png')
        pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{out}/{tag}-full.png', full_page=True)
        sideways = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
        broken = pg.evaluate("[...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map(i => i.src)")
        if errs or sideways > 0 or broken: problems.append({'shot': tag, 'errors': errs, 'sideways': sideways, 'broken': broken})
        ctx.close()
    b.close()
print(json.dumps(problems, indent=1) if problems else 'no problems')
