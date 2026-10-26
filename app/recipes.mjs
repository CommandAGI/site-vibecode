// The local engine of the VibeCode demo (docs: README.md). A description picks one recipe by its words, and the recipe
// writes a complete program: one HTML document with a canvas and its script, which the editor shows and the preview runs
// in a sandboxed frame. Nothing here calls a model or the network, so the same file runs in the browser and in Node for
// the site's tests (tests/recipes.test.mjs).

/** The recipes, in the order the demo offers them. `words` matches a description in English, Spanish and Chinese. */
export const RECIPES = [
    {
        id: 'bounce',
        words: ['bounc', 'ball', 'bota', 'pelota', 'rebota', '球', '弹跳', '皮球'],
        title: { en: 'A bouncing ball', es: 'Una pelota que rebota', 'zh-Hans': '一个弹跳的球' },
    },
    {
        id: 'clock',
        words: ['clock', 'time', 'watch', 'reloj', 'hora', '钟', '时钟', '时间'],
        title: { en: 'A clock', es: 'Un reloj', 'zh-Hans': '一个时钟' },
    },
    {
        id: 'bars',
        words: ['chart', 'graph', 'bar', 'plot', 'gráfico', 'grafico', 'barras', '图', '图表', '柱'],
        title: { en: 'A bar chart', es: 'Un gráfico de barras', 'zh-Hans': '一个柱状图' },
    },
    {
        id: 'stars',
        words: ['star', 'space', 'galaxy', 'estrella', 'espacio', '星', '星空', '太空'],
        title: { en: 'A starfield', es: 'Un campo de estrellas', 'zh-Hans': '一片星空' },
    },
    {
        id: 'wave',
        words: ['wave', 'sine', 'sound', 'signal', 'onda', 'seno', '波', '正弦', '信号'],
        title: { en: 'A wave', es: 'Una onda', 'zh-Hans': '一道波' },
    },
    {
        id: 'fireworks',
        words: ['firework', 'party', 'celebrat', 'fest', 'fuego artificial', 'fiesta', '烟花', '庆祝', '派对'],
        title: { en: 'Fireworks', es: 'Fuegos artificiales', 'zh-Hans': '烟花' },
    },
];

/** The recipe that answers a description: the one with the most matching words, else the words' own drawing. */
export function pickRecipe(text) {
    const lower = String(text ?? '').toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const recipe of RECIPES) {
        const score = recipe.words.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
        if (score > bestScore) {
            best = recipe.id;
            bestScore = score;
        }
    }
    return best ?? 'text';
}

/** Every kind of program the demo can write, the fallback included. */
export const KINDS = [...RECIPES.map(r => r.id), 'text'];

/** The title of a generated program in the visitor's language. */
export function titleOf(id, lang = 'en') {
    const recipe = RECIPES.find(r => r.id === id);
    if (recipe) return recipe.title[lang] ?? recipe.title.en;
    return { en: 'Your words, drawn', es: 'Tus palabras, dibujadas', 'zh-Hans': '把你的话画出来' }[lang]
        ?? 'Your words, drawn';
}

/** The page every recipe shares: one canvas, the whole window, a dark ground. */
function page(title, script) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
html, body { margin: 0; height: 100%; background: #0b0d10; overflow: hidden; }
canvas { display: block; width: 100vw; height: 100vh; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const c = document.getElementById('c');
const x = c.getContext('2d');
let W = 0, H = 0;
function fit() {
  const d = window.devicePixelRatio || 1;
  W = c.clientWidth; H = c.clientHeight;
  c.width = Math.round(W * d); c.height = Math.round(H * d);
  x.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener('resize', fit); fit();
${script}
</script>
</body>
</html>
`;
}

const SCRIPTS = {
    bounce: `// A ball with gravity, a floor and three walls. It starts fast and loses a little on each bounce.
const r = Math.max(12, Math.min(W, H) * 0.06);
let px = W * 0.3, py = H * 0.3, vx = 260, vy = 0;
const g = 1400, floor = () => H - r - 8, wall = () => W - r;
let px0 = 0, py0 = 0;
function frame(dt) {
  vy += g * dt;
  px += vx * dt; py += vy * dt;
  if (py > floor()) { py = floor(); vy = -vy * 0.82; vx *= 0.995; if (Math.abs(vy) < 40) vy = -520; }
  if (px > wall()) { px = wall(); vx = -vx; }
  if (px < r) { px = r; vx = -vx; }
  if (py < r) { py = r; vy = Math.abs(vy); }
}
function draw() {
  x.fillStyle = 'rgba(11, 13, 16, 0.22)'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(190, 242, 100, 0.18)'; x.lineWidth = 1;
  x.beginPath(); x.moveTo(0, floor() + r); x.lineTo(W, floor() + r); x.stroke();
  const glow = x.createRadialGradient(px, py, 0, px, py, r * 2.4);
  glow.addColorStop(0, 'rgba(190, 242, 100, 0.55)'); glow.addColorStop(1, 'rgba(190, 242, 100, 0)');
  x.fillStyle = glow; x.beginPath(); x.arc(px, py, r * 2.4, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#bef264'; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
}
let last = 0;
requestAnimationFrame(function step(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
  frame(dt); draw(); requestAnimationFrame(step);
});`,

    clock: `// An analog clock: the hour, minute and second hands of this computer's clock, ticking every frame.
function hand(angle, length, width, colour) {
  x.strokeStyle = colour; x.lineWidth = width; x.lineCap = 'round';
  x.beginPath(); x.moveTo(W / 2, H / 2);
  x.lineTo(W / 2 + Math.cos(angle) * length, H / 2 + Math.sin(angle) * length); x.stroke();
}
function draw(now) {
  const R = Math.min(W, H) * 0.36;
  x.clearRect(0, 0, W, H);
  x.fillStyle = '#0b0d10'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(226, 232, 240, 0.9)'; x.lineWidth = 2;
  x.beginPath(); x.arc(W / 2, H / 2, R, 0, Math.PI * 2); x.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r0 = R * 0.92, r1 = R * (i % 3 === 0 ? 0.8 : 0.87);
    x.strokeStyle = i % 3 === 0 ? '#bef264' : 'rgba(226, 232, 240, 0.45)'; x.lineWidth = i % 3 === 0 ? 3 : 1.5;
    x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0);
    x.lineTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1); x.stroke();
  }
  const s = now.getSeconds() + now.getMilliseconds() / 1000;
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  hand((h / 12) * Math.PI * 2 - Math.PI / 2, R * 0.5, 7, '#e2e8f0');
  hand((m / 60) * Math.PI * 2 - Math.PI / 2, R * 0.72, 4.5, '#e2e8f0');
  hand((s / 60) * Math.PI * 2 - Math.PI / 2, R * 0.82, 2, '#bef264');
  x.fillStyle = '#bef264'; x.beginPath(); x.arc(W / 2, H / 2, 5, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(226, 232, 240, 0.65)'; x.font = '600 15px ui-monospace, monospace'; x.textAlign = 'center';
  x.fillText(now.toLocaleTimeString(), W / 2, H / 2 + R + 34);
}
function step() { draw(new Date()); requestAnimationFrame(step); }
requestAnimationFrame(step);`,

    bars: `// A bar chart of the numbers in your description, or of six sample months when it has none.
const found = (DESCRIPTION.match(/-?\\d+(\\.\\d+)?/g) || []).map(Number).slice(0, 12);
const values = found.length >= 2 ? found : [12, 19, 15, 27, 22, 34];
const labels = found.length >= 2 ? values.map((_, i) => String(i + 1)) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
let grow = 0;
function draw() {
  x.fillStyle = '#0b0d10'; x.fillRect(0, 0, W, H);
  const pad = 44, top = 28, bottom = 40;
  const max = Math.max(...values, 1);
  const bw = (W - pad * 2) / values.length;
  x.strokeStyle = 'rgba(226, 232, 240, 0.18)'; x.lineWidth = 1;
  x.beginPath(); x.moveTo(pad, H - bottom); x.lineTo(W - pad, H - bottom); x.stroke();
  values.forEach((v, i) => {
    const h = ((H - top - bottom) * v) / max * grow;
    const bx = pad + i * bw + bw * 0.18, bwid = bw * 0.64;
    const grad = x.createLinearGradient(0, H - bottom - h, 0, H - bottom);
    grad.addColorStop(0, '#bef264'); grad.addColorStop(1, 'rgba(190, 242, 100, 0.25)');
    x.fillStyle = grad; x.fillRect(bx, H - bottom - h, bwid, h);
    x.fillStyle = 'rgba(226, 232, 240, 0.8)'; x.font = '600 13px ui-monospace, monospace'; x.textAlign = 'center';
    x.fillText(String(v), bx + bwid / 2, H - bottom - h - 8);
    x.fillStyle = 'rgba(226, 232, 240, 0.5)'; x.font = '12px ui-monospace, monospace';
    x.fillText(labels[i], bx + bwid / 2, H - bottom + 18);
  });
}
function step() { grow = Math.min(1, grow + 0.06); draw(); if (grow < 1) requestAnimationFrame(step); }
requestAnimationFrame(step);`,

    stars: `// A starfield: points fly out of the middle of the screen, faster as they near the edge.
const N = 220, stars = [];
for (let i = 0; i < N; i++) stars.push({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() });
function draw() {
  x.fillStyle = 'rgba(11, 13, 16, 0.35)'; x.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, f = Math.min(W, H) * 0.5;
  for (const s of stars) {
    const px = cx + (s.x / s.z) * f, py = cy + (s.y / s.z) * f;
    const size = Math.max(0.4, (1 - s.z) * 2.2);
    const a = Math.min(1, (1 - s.z) * 1.4);
    if (px >= 0 && px <= W && py >= 0 && py <= H) {
      x.fillStyle = 'rgba(226, 232, 240, ' + a.toFixed(3) + ')';
      x.fillRect(px, py, size, size);
    }
    s.z -= 0.004;
    if (s.z <= 0.02) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; }
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,

    wave: `// Two sine waves, one trailing the other, drawn across the window.
const waves = [
  { amp: 0.16, len: 0.9, speed: 1.4, colour: '#bef264', width: 3 },
  { amp: 0.1, len: 1.7, speed: -0.9, colour: 'rgba(148, 197, 255, 0.85)', width: 2 },
];
let t = 0;
function draw() {
  x.fillStyle = '#0b0d10'; x.fillRect(0, 0, W, H);
  for (const w of waves) {
    x.strokeStyle = w.colour; x.lineWidth = w.width; x.lineJoin = 'round';
    x.beginPath();
    for (let px = 0; px <= W; px += 2) {
      const y = H / 2 + Math.sin(px / (W * 0.12) * w.len + t * w.speed) * H * w.amp;
      px === 0 ? x.moveTo(px, y) : x.lineTo(px, y);
    }
    x.stroke();
  }
  t += 0.02;
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,

    fireworks: `// Fireworks: a shell rises, then bursts into 90 sparks that fall and fade.
const sparks = [];
let shell = null, timer = 0;
function launch() { shell = { x: W * (0.25 + Math.random() * 0.5), y: H, vy: -(H * 0.55), hue: 60 + Math.random() * 120 }; }
function burst(at) {
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2, speed = 60 + Math.random() * 200;
    sparks.push({ x: at.x, y: at.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1, hue: at.hue });
  }
}
function step(dt) {
  x.fillStyle = 'rgba(11, 13, 16, 0.18)'; x.fillRect(0, 0, W, H);
  if (!shell && sparks.length < 40) { timer -= dt; if (timer <= 0) { launch(); timer = 0.6 + Math.random(); } }
  if (shell) {
    shell.y += shell.vy * dt; shell.vy += 260 * dt;
    x.fillStyle = 'hsl(' + shell.hue + ' 90% 70%)'; x.beginPath(); x.arc(shell.x, shell.y, 3, 0, Math.PI * 2); x.fill();
    if (shell.vy > -60) { burst(shell); shell = null; }
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 220 * dt; s.vx *= 0.99; s.life -= dt * 0.55;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    x.fillStyle = 'hsla(' + s.hue + ' 90% 68% / ' + s.life.toFixed(2) + ')';
    x.fillRect(s.x, s.y, 2, 2);
  }
}
let last = 0;
requestAnimationFrame(function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
  step(dt); requestAnimationFrame(loop);
});`,

    text: `// No recipe matched, so the program draws your own words: they drift across the window.
const words = DESCRIPTION.split(/\\s+/).filter(Boolean).slice(0, 24);
const items = (words.length ? words : ['vibecode']).map((w, i) => ({
  w, x: Math.random() * W, y: Math.random() * H,
  vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90,
  size: 18 + (i % 4) * 9,
}));
function draw() {
  x.fillStyle = 'rgba(11, 13, 16, 0.14)'; x.fillRect(0, 0, W, H);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  for (const it of items) {
    it.x = (it.x + it.vx * 0.016 + W) % W; it.y = (it.y + it.vy * 0.016 + H) % H;
    x.fillStyle = 'rgba(190, 242, 100, 0.75)';
    x.font = '700 ' + it.size + 'px ui-sans-serif, system-ui, sans-serif';
    x.fillText(it.w, it.x, it.y);
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);`,
};

/** Comments that put the visitor's description in the code, whichever language it is in. */
const COMMENTS = {
    en: d => `// VibeCode: code by description. You described:\n// ${d || 'nothing yet'}\n`,
    es: d => `// VibeCode: código a partir de una descripción. Describiste:\n// ${d || 'nada todavía'}\n`,
    'zh-Hans': d => `// VibeCode：用描述写代码。你的描述是：\n// ${d || '还没有'}\n`,
};

/**
 * The program a description makes: a complete HTML document, ready to run. `lang` picks the comments' language and the
 * title, and `description` is the visitor's own text (kept out of the script's code path where it is only a comment).
 */
export function generate(description, lang = 'en') {
    const text = String(description ?? '').trim().slice(0, 400);
    const id = pickRecipe(text);
    const title = titleOf(id, lang);
    // The description lands in a comment inside the program's script: no `<` or `>` survives, so it cannot close the
    // script or open a tag, and no `*/` closes a block comment.
    const comment = (COMMENTS[lang] ?? COMMENTS.en)(text.replace(/[<>]/g, ' ').replace(/\*\//g, '* /').replace(/[\r\n]+/g, ' '));
    const head = `${comment}${id === 'text' ? `const DESCRIPTION = ${JSON.stringify(text).replace(/</g, '\\u003c')};\n` : ''}`;
    return page(title, head + SCRIPTS[id]);
}

/** The program's kind, for the demo's own labels. */
export function kindOf(description) {
    return pickRecipe(description);
}
