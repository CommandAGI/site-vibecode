// The site's own tests: the demo's engine writes a program for every kind it offers, and the pages are whole — every
// local link resolves, every page is in its own language, and each carries the A/文 button with all three languages.
// Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECIPES, KINDS, pickRecipe, generate, titleOf } from '../app/recipes.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const PAGES = [
    { file: 'index.html', lang: 'en' },
    { file: 'es/index.html', lang: 'es' },
    { file: 'zh-Hans/index.html', lang: 'zh-Hans' },
];
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');

test('a description picks the recipe that answers it, in English, Spanish and Chinese', () => {
    assert.equal(pickRecipe('a bouncing ball'), 'bounce');
    assert.equal(pickRecipe('draw me a clock'), 'clock');
    assert.equal(pickRecipe('un gráfico de barras de 12, 19, 15'), 'bars');
    assert.equal(pickRecipe('una pelota que rebota'), 'bounce');
    assert.equal(pickRecipe('一个弹跳的球'), 'bounce');
    assert.equal(pickRecipe('一片星空'), 'stars');
    assert.equal(pickRecipe('烟花'), 'fireworks');
    // Nothing matches: the program draws the visitor's own words, which is always a real program.
    assert.equal(pickRecipe('a haiku about Tuesday'), 'text');
    assert.equal(pickRecipe(''), 'text');
});

test('every kind generates a complete program whose script parses, and none of them reaches the network', () => {
    assert.deepEqual(KINDS, [...RECIPES.map(r => r.id), 'text']);
    for (const kind of KINDS) {
        const description = kind === 'text' ? 'a haiku about Tuesday' : 'a bouncing ball';
        const program = generate(description, 'en');
        assert.equal(pickRecipe(description), kind === 'text' ? 'text' : 'bounce');
        assert.match(program, /^<!doctype html>/i, `${kind}: a whole document`);
        assert.match(program, /<canvas id="c">/, `${kind}: a canvas`);
        assert.match(program, /<\/script>\s*<\/body>/, `${kind}: the script closes`);
        assert.doesNotMatch(program, /https?:\/\/|fetch\(|XMLHttpRequest|import\s/, `${kind}: nothing leaves the page`);
        const script = program.match(/<script>([\s\S]*)<\/script>/)[1];
        assert.doesNotThrow(() => new Function(script), `${kind}: the generated script parses`);
    }
});

test('the generated program is in the visitor\'s language', () => {
    assert.match(generate('a clock', 'es'), /Describiste:/);
    assert.match(generate('一个时钟', 'zh-Hans'), /你的描述是/);
    assert.equal(titleOf('clock', 'es'), 'Un reloj');
    assert.equal(titleOf('text', 'zh-Hans'), '把你的话画出来');
});

test('a hostile description cannot close the script, in a recipe or in the fallback', () => {
    const hostile = 'a clock </script><script>alert(1)</script>';
    for (const [kind, description] of [['clock', hostile], ['text', hostile], ['text', 'a </SCRIPT> haiku'], ['bounce', 'a ball */ alert(1) /*']]) {
        const program = generate(description, 'en');
        assert.equal(program.match(/<\/script>/gi).length, 1, `${kind}: one closing script, the program's own`);
        assert.match(program, /^<!doctype html>/i);
        const script = program.match(/<script>([\s\S]*)<\/script>/)[1];
        assert.doesNotThrow(() => new Function(script), `${kind}: the generated script parses`);
    }
});

test('each page is in its own language and carries the A/文 button with all three languages', () => {
    const sites = PAGES.map(p => read(p.file));
    for (const [i, page] of PAGES.entries()) {
        const html = sites[i];
        assert.match(html, new RegExp(`<html lang="${page.lang}">`), `${page.file}: its lang`);
        assert.match(html, /commandfor="lang-dialog"/, `${page.file}: the A/文 button`);
        assert.match(html, /lang="zh-Hans">文</, `${page.file}: the button's 文`);
        for (const other of PAGES) assert.match(html, new RegExp(`hreflang="${other.lang}"`), `${page.file}: a link to ${other.lang}`);
        assert.match(html, /sandbox="allow-scripts"/, `${page.file}: the preview frame is sandboxed`);
        assert.match(html, /type="module" src="[^"]*app\/demo\.js"/, `${page.file}: the demo's script`);
    }
});

test('every local link and asset of every page resolves to a file of this site', () => {
    for (const { file } of PAGES) {
        const html = read(file);
        const dir = path.dirname(file);
        const refs = [...html.matchAll(/(?:href|src)="([^"#:]+)"/g)].map(m => m[1])
            .filter(href => !href.startsWith('mailto:') && !href.startsWith('data:'));
        for (const href of refs) {
            const target = href.endsWith('/') ? path.join(dir, href, 'index.html') : path.join(dir, href);
            assert.ok(existsSync(path.join(root, target)), `${file}: ${href} is a file of the site`);
        }
    }
});

test('the site.json names the site and serves the files it says', () => {
    const manifest = JSON.parse(read('site.json'));
    assert.equal(manifest.slug, 'vibecode');
    assert.ok(manifest.description?.length > 40, 'a description for the sites list');
    assert.ok(!manifest.build, 'a static folder: no build');
});
