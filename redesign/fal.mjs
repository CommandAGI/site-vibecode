// The site's generated media, made once on a build machine: fal is called here, never from a page.
//   COMMANDAGI_ENV_ROOT=<checkout> node redesign/fal.mjs <job> [...]
// The key is read from the env cascade (SVC__FAL__MAIN__API_KEY) and never printed. Every request and its cost
// estimate goes to redesign/media/log.jsonl; NOTES.md is written from that log.
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'media');

function key() {
    if (process.env.SVC__FAL__MAIN__API_KEY) return process.env.SVC__FAL__MAIN__API_KEY;
    const root = process.env.COMMANDAGI_ENV_ROOT;
    for (const f of ['.env', '.env.api', '.env.local']) {
        const file = root && path.join(root, f);
        if (!file || !existsSync(file)) continue;
        const m = /^(?:export\s+)?SVC__FAL__MAIN__API_KEY=["']?([^"'\n]+)/m.exec(readFileSync(file, 'utf8'));
        if (m) return m[1].trim();
    }
    throw new Error('no SVC__FAL__MAIN__API_KEY in the env cascade');
}
const auth = { Authorization: `Key ${key()}` };

async function run(model, input) {
    const r = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify(input) });
    if (!r.ok) throw new Error(`${model}: ${r.status} ${await r.text()}`);
    const job = await r.json();
    for (;;) {
        await new Promise(res => setTimeout(res, 4000));
        const s = await (await fetch(job.status_url, { headers: auth })).json();
        if (s.status === 'COMPLETED') break;
        if (s.status && !['IN_QUEUE', 'IN_PROGRESS'].includes(s.status)) throw new Error(`${model}: ${JSON.stringify(s)}`);
    }
    return (await fetch(job.response_url, { headers: auth })).json();
}

async function save(url, name) {
    const r = await fetch(url);
    writeFileSync(path.join(out, name), Buffer.from(await r.arrayBuffer()));
    return name;
}

// Art direction, every prompt: close-ups of type, paper and ink, never a person, a face or a screen; high-key north
// daylight, crisp macro, white paper. The page grades them to its ink duotone (redesign/DESIGN.md § media).
const LOOK = 'high-key north window daylight, crisp macro photograph, shallow depth of field, clean white paper, cool neutral tones, editorial still life, no people, no hands, no faces, no screens, no legible words, no logos';
const STILLS = {
    sorts: { aspect_ratio: '16:9', prompt: `Extreme macro of lead letterpress type sorts set in a row inside a steel composing stick, the mirrored letter faces catching the light, spacers and quads between words, ${LOOK}` },
    proof: { aspect_ratio: '16:9', prompt: `Overhead view of a printed proof sheet of a typeset page lying on a white table, dense lines of small serif type out of focus, one line swiped with a chartreuse yellow-green highlighter and a few ultramarine blue pencil proofreading marks in the margin, a blue pencil resting beside it, ${LOOK}` },
    ink: { aspect_ratio: '16:9', prompt: `Seen from directly above, a flat uncut sheet of thick white watercolor paper filling the whole frame, a single large blot of deep ultramarine blue ink soaking into it in the middle, soft feathered bleeding edges, fine paper texture, ${LOOK}` },
    stick: { aspect_ratio: '9:16', prompt: `Vertical macro of a wooden type case drawer with small compartments of lead type sorts, one compartment empty, soft daylight, ${LOOK}` },
};
const MOTION = {
    sorts: 'very slow macro dolly along the line of type, gentle rack focus, static lighting, no new objects',
    proof: 'static overhead camera, soft daylight slowly drifts across the paper, a faint shadow of a window frame passes, very subtle',
    ink: 'static camera, the ink slowly blooms and spreads outward through the paper fibers, calm, continuous',
};

const log = entry => appendFileSync(path.join(out, 'log.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n');

const IMAGE = 'fal-ai/flux-pro/v1.1-ultra';
const VIDEO = 'fal-ai/kling-video/v2.1/standard/image-to-video';

const [job, ...names] = process.argv.slice(2);
if (job === 'stills') {
    await Promise.all((names.length ? names : Object.keys(STILLS)).map(async name => {
        const input = { ...STILLS[name], raw: true, output_format: 'png', safety_tolerance: '2' };
        const res = await run(IMAGE, input);
        await save(res.images[0].url, `${name}.png`);
        log({ model: IMAGE, name, prompt: input.prompt, aspect_ratio: input.aspect_ratio, seed: res.seed, usd: 0.06 });
        console.log(`${name}.png`);
    }));
} else if (job === 'videos') {
    await Promise.all((names.length ? names : Object.keys(MOTION)).map(async name => {
        // The still goes up as a data URI: nothing of the site is published before it ships.
        const image_url = `data:image/png;base64,${readFileSync(path.join(out, `${name}.png`)).toString('base64')}`;
        const input = { prompt: MOTION[name], duration: '5', negative_prompt: 'people, person, hands, face, screen, legible text, blur, distort, camera shake' };
        const res = await run(VIDEO, { ...input, image_url });
        await save(res.video.url, `${name}.mp4`);
        log({ model: VIDEO, name, prompt: input.prompt, from: `${name}.png`, duration_s: 5, usd: 0.28 });
        console.log(`${name}.mp4`);
    }));
} else {
    console.error('usage: node redesign/fal.mjs stills|videos [name ...]');
    process.exit(2);
}
