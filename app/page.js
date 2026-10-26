// The page's own motion (redesign/DESIGN.md): the line-number gutter and the phone's status bar follow the section in
// view, the film loops play only while seen (never under reduced motion), and scroll writes the compile section's
// sentence into code, step by step, while its canvas runs the lines written so far. Everything here is progressive:
// without it the page is whole, every step shown.
const still = matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main > section[id]')];
const gutterLinks = [...document.querySelectorAll('.gutter a')];
const ln = document.querySelector('[data-ln]');
const sec = document.querySelector('[data-sec]');
const tocLinks = [...document.querySelectorAll('#toc a')];

// ── the section in view ───────────────────────────────────────────────────────────────────────────────────────
const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const i = sections.indexOf(entry.target);
        gutterLinks.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
        if (ln) ln.textContent = String(i + 1);
        if (sec && tocLinks[i]) sec.textContent = tocLinks[i].textContent;
    }
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => seen.observe(s));
const toc = document.getElementById('toc');
tocLinks.forEach((a) => a.addEventListener('click', () => toc?.hidePopover?.()));

// ── the film: play while seen ─────────────────────────────────────────────────────────────────────────────────
const loops = [...document.querySelectorAll('video[data-loop]')];
const film = new IntersectionObserver((entries) => {
    for (const { target: video, isIntersecting } of entries) {
        if (still.matches) continue;
        if (isIntersecting) {
            if (video.preload === 'none') { video.preload = 'auto'; video.load(); }
            video.play().then(() => video.classList.add('is-playing')).catch(() => {});
        } else video.pause();
    }
}, { rootMargin: '120px 0px' });
loops.forEach((v) => film.observe(v));

// ── a sentence, compiled ──────────────────────────────────────────────────────────────────────────────────────
const compile = document.getElementById('compile');
const phrases = [...document.querySelectorAll('.sentence [data-k]')];
const lines = [...document.querySelectorAll('.galley .ln')];
const label = document.querySelector('[data-step-label]');
const live = document.querySelector('[data-step-live]');
const canvas = document.getElementById('runner');
const STEPS = phrases.length;
let step = -1;
let focus = 0;

function show(n, now = n) {
    const changed = n !== step;
    step = n;
    focus = now;
    phrases.forEach((p, i) => { p.classList.toggle('is-on', i < n); p.classList.toggle('is-now', i + 1 === now); p.setAttribute('aria-pressed', String(i < n)); });
    lines.forEach((l, i) => { l.classList.toggle('is-on', i < n); l.classList.toggle('is-now', i + 1 === now); });
    if (label) label.textContent = label.textContent.replace(/\d+(\D+)(\d+)/, `${n}$1$2`);
    if (changed && live && n > 0) live.textContent = `${phrases[n - 1].textContent.trim()} → ${lines[n - 1].querySelector('code').textContent.replace(/\s+/g, ' ')}`;
}

function fromScroll() {
    if (still.matches || !compile) return;
    const box = compile.getBoundingClientRect();
    const span = compile.offsetHeight - innerHeight;
    const progress = Math.min(1, Math.max(0, -box.top / Math.max(1, span)));
    const n = Math.min(STEPS, Math.floor(progress * (STEPS + 0.6)));
    if (n !== step) show(n);
}

phrases.forEach((p, i) => {
    p.addEventListener('click', () => {
        const k = i + 1;
        if (still.matches || !compile) return show(STEPS, k);
        const span = compile.offsetHeight - innerHeight;
        scrollTo({ top: compile.offsetTop + span * ((k + 0.3) / (STEPS + 0.6)), behavior: 'smooth' });
        show(k);
    });
    p.addEventListener('focus', () => show(Math.max(step, i + 1), i + 1));
});

// The program the galley shows, run as far as it is written. One ball, a floor, a trail of 24.
const ctx = canvas?.getContext('2d');
const ball = { x: 60, y: 40, r: 14, vy: 0, vx: 150 };
const trail = [];
let last = 0;
function fit() {
    if (!canvas) return;
    const d = devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * d);
    canvas.height = Math.round(canvas.clientHeight * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
}
function frame(t) {
    const W = canvas.clientWidth, H = canvas.clientHeight, floor = H - ball.r - 10;
    const dt = Math.min(0.04, (t - last) / 1000 || 0.016);
    last = t;
    if (step >= 1) {
        ball.x += ball.vx * dt;
        if (ball.x > W - ball.r || ball.x < ball.r) { ball.vx = -ball.vx; ball.x = Math.min(W - ball.r, Math.max(ball.r, ball.x)); }
    }
    if (step >= 2) { ball.vy += 1400 * dt; ball.y += ball.vy * dt; }
    if (step >= 3 && ball.y > floor) { ball.y = floor; ball.vy *= -0.82; if (Math.abs(ball.vy) < 60) ball.vy = -620; }
    if (step === 2 && ball.y > H + 40) { ball.y = -20; ball.vy = 0; }
    if (step >= 4) { trail.push({ x: ball.x, y: ball.y }); if (trail.length > 24) trail.shift(); } else trail.length = 0;
    if (step < 2) { ball.y = Math.min(ball.y, floor); }
    draw(W, H, floor);
}
function draw(W, H, floor) {
    ctx.fillStyle = '#191919';
    ctx.fillRect(0, 0, W, H);
    if (step >= 3) { ctx.strokeStyle = 'rgba(230, 251, 101, .35)'; ctx.beginPath(); ctx.moveTo(0, floor + ball.r + .5); ctx.lineTo(W, floor + ball.r + .5); ctx.stroke(); }
    trail.forEach((p, i) => { ctx.fillStyle = `rgba(125, 147, 255, ${(i / trail.length) * 0.55})`; ctx.beginPath(); ctx.arc(p.x, p.y, ball.r * (0.4 + 0.6 * i / trail.length), 0, Math.PI * 2); ctx.fill(); });
    if (step >= 1) { ctx.fillStyle = '#e6fb65'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = 'rgba(253, 253, 251, .5)'; ctx.font = 'italic 18px "EB Garamond", serif'; ctx.fillText(canvas.dataset.empty || '', 18, H / 2 + 6); }
}
/** Under reduced motion, one still of the finished program: the ball mid-bounce with its trail. */
function stillFrame() {
    const W = canvas.clientWidth, H = canvas.clientHeight, floor = H - ball.r - 10;
    trail.length = 0;
    for (let i = 0; i < 24; i++) { const u = i / 23; trail.push({ x: 40 + u * W * 0.6, y: floor - Math.abs(Math.sin(u * Math.PI * 1.6)) * (H * 0.6) }); }
    Object.assign(ball, trail[trail.length - 1]);
    draw(W, H, floor);
}
function loop(t) {
    if (still.matches) return;
    const box = compile.getBoundingClientRect();
    if (box.bottom > 0 && box.top < innerHeight) frame(t); else last = t;
    requestAnimationFrame(loop);
}
if (canvas && compile) {
    fit();
    addEventListener('resize', () => { fit(); if (still.matches) stillFrame(); });
    if (still.matches) { show(STEPS, 0); stillFrame(); }
    else {
        show(0);
        addEventListener('scroll', fromScroll, { passive: true });
        fromScroll();
        requestAnimationFrame(loop);
    }
}
