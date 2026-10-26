// The demo page's script: the description box, the code editor, the preview frame (README.md § the demo).
// It is an ES module and loads the local engine (app/recipes.mjs). It sends nothing anywhere: the program it writes runs
// in a sandboxed frame with no network, and the page makes no request after its own files load.
import { generate } from './recipes.mjs';

const lang = document.documentElement.lang === 'zh-Hans' ? 'zh-Hans' : document.documentElement.lang === 'es' ? 'es' : 'en';

const WORDS = {
    en: {
        example: 'a bouncing ball',
        hint: 'Describe a program, then generate it.',
        generated: (title) => `Generated: ${title}. Change any line and run it again.`,
        ran: 'Ran your code in the frame below.',
        copied: 'Code copied.',
        copyFailed: 'Select the code and copy it.',
        empty: 'Write a description first.',
    },
    es: {
        example: 'una pelota que rebota',
        hint: 'Describe un programa y genéralo.',
        generated: (title) => `Generado: ${title}. Cambia cualquier línea y vuelve a ejecutarlo.`,
        ran: 'Tu código se ejecutó en el marco de abajo.',
        copied: 'Código copiado.',
        copyFailed: 'Selecciona el código y cópialo.',
        empty: 'Escribe primero una descripción.',
    },
    'zh-Hans': {
        example: '一个弹跳的球',
        hint: '描述一个程序，然后生成它。',
        generated: (title) => `已生成：${title}。修改任意一行，再运行一次。`,
        ran: '你的代码已在下面的框架中运行。',
        copied: '已复制代码。',
        copyFailed: '请选中代码后复制。',
        empty: '请先写一段描述。',
    },
};

const t = WORDS[lang] ?? WORDS.en;
const $ = (id) => document.getElementById(id);
const describe = $('describe');
const code = $('code');
const frame = $('preview');
const status = $('status');
const chips = [...document.querySelectorAll('[data-example]')];

/** Write the code for what is in the description box, and run it. */
function compose(run) {
    const text = describe.value.trim();
    if (!text) {
        status.textContent = t.empty;
        describe.focus();
        return;
    }
    const program = generate(text, lang);
    code.value = program;
    status.textContent = t.generated(titleFromProgram(program));
    if (run) play(program);
}

/** A program's own title, for the status line. */
function titleFromProgram(program) {
    return (program.match(/<title>([^<]*)<\/title>/) || [null, ''])[1];
}

/** Run a program in the frame. The frame has no same-origin access, so the code cannot reach this page. */
function play(program) {
    frame.srcdoc = program;
}

describe.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        compose(true);
    }
});

$('generate').addEventListener('click', () => compose(true));
$('run').addEventListener('click', () => {
    if (!code.value.trim()) {
        status.textContent = t.empty;
        return;
    }
    play(code.value);
    status.textContent = t.ran;
});
$('copy').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(code.value);
        status.textContent = t.copied;
    } catch {
        code.select();
        status.textContent = t.copyFailed;
    }
});
$('reset').addEventListener('click', () => compose(true));

for (const chip of chips) {
    chip.addEventListener('click', () => {
        describe.value = chip.dataset.example;
        compose(true);
    });
}

describe.placeholder = t.hint;
describe.value = t.example;
compose(true);
