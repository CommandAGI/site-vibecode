# es/index.html and zh-Hans/index.html from index.html: one page, three languages. Each English segment below must be
# found in index.html (the script stops if one is not), so a change to the English page that is not translated fails here.
#   python3 redesign/tools/locales.py   (from the site folder)
import re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
en = (root / 'index.html').read_text()

# (English, Spanish, Chinese). Longer segments first where one contains another.
T = [
    ('<title>VibeCode — say it in a sentence, run it as code</title>', '<title>VibeCode — dilo en una frase, ejecútalo como código</title>', '<title>VibeCode — 用一句话说出来，作为代码运行</title>'),
    ('content="VibeCode writes a working program from one sentence. You read every line, change it and run it in the browser. A company of CommandAGI."', 'content="VibeCode escribe un programa que funciona a partir de una frase. Lees cada línea, la cambias y la ejecutas en el navegador. Una empresa de CommandAGI."', 'content="VibeCode 用一句话写出能运行的程序。每一行你都能读、能改，并在浏览器里运行。CommandAGI 旗下公司。"'),
    ('content="VibeCode — say it in a sentence, run it as code"', 'content="VibeCode — dilo en una frase, ejecútalo como código"', 'content="VibeCode — 用一句话说出来，作为代码运行"'),
    ('content="A sentence becomes a program you can read, change and run in the browser."', 'content="Una frase se convierte en un programa que puedes leer, cambiar y ejecutar en el navegador."', 'content="一句话变成一个你能读、能改、能在浏览器里运行的程序。"'),
    ('>Skip to the demo<', '>Ir a la demo<', '>跳到演示<'),
    ('aria-label="VibeCode, home"', 'aria-label="VibeCode, inicio"', 'aria-label="VibeCode，首页"'),
    ('>Try it<', '>Pruébalo<', '>试一试<'),
    ('aria-label="Sections"', 'aria-label="Secciones"', 'aria-label="章节"'),
    ('data-label="The sentence"', 'data-label="La frase"', 'data-label="一句话"'),
    ('data-label="It compiles"', 'data-label="Se compila"', 'data-label="编译"'),
    ('data-label="Read"', 'data-label="Leer"', 'data-label="阅读"'),
    ('data-label="The demo"', 'data-label="La demo"', 'data-label="演示"'),
    ('data-label="How it works"', 'data-label="Cómo funciona"', 'data-label="如何工作"'),
    ('data-label="Sandbox"', 'data-label="Aislado"', 'data-label="沙箱"'),
    ('data-label="Pricing"', 'data-label="Precios"', 'data-label="价格"'),
    ('data-label="Notes"', 'data-label="Notas"', 'data-label="注释"'),
    ('<span data-sec>The sentence</span>', '<span data-sec>La frase</span>', '<span data-sec>一句话</span>'),
    ('<span>Ln&nbsp;', '<span>Lín&nbsp;', '<span>行&nbsp;'),
    ('>≡ sections<', '>≡ secciones<', '>≡ 章节<'),
    ('>Go to line<', '>Ir a la línea<', '>跳到行<'),
    ('<a href="#top">The sentence</a>', '<a href="#top">La frase</a>', '<a href="#top">一句话</a>'),
    ('<a href="#compile">It compiles</a>', '<a href="#compile">Se compila</a>', '<a href="#compile">编译</a>'),
    ('<a href="#read">Read</a>', '<a href="#read">Leer</a>', '<a href="#read">阅读</a>'),
    ('<a href="#demo">The demo</a>', '<a href="#demo">La demo</a>', '<a href="#demo">演示</a>'),
    ('<a href="#how">How it works</a>', '<a href="#how">Cómo funciona</a>', '<a href="#how">如何工作</a>'),
    ('<a href="#sandbox">Sandbox</a>', '<a href="#sandbox">Aislado</a>', '<a href="#sandbox">沙箱</a>'),
    ('<a href="#pricing">Pricing</a>', '<a href="#pricing">Precios</a>', '<a href="#pricing">价格</a>'),
    ('<a href="#faq">Notes</a>', '<a href="#faq">Notas</a>', '<a href="#faq">注释</a>'),
    ('<a href="#demo">Demo</a>', '<a href="#demo">Demo</a>', '<a href="#demo">演示</a>'),
    ('fig. 1 — lead type in a composing stick. Generated (fal), not a photograph.', 'fig. 1 — tipos de plomo en un componedor. Generado (fal), no es una fotografía.', '图 1 — 排字手托里的铅字。生成图像（fal），不是照片。'),
    ('<span class="say">Say it in a sentence.</span>', '<span class="say">Dilo en una frase.</span>', '<span class="say">用一句话说出来。</span>'),
    ('VibeCode writes a working program from one sentence. You read every line, change it, and run it — here, in the browser.', 'VibeCode escribe un programa que funciona a partir de una frase. Lees cada línea, la cambias y la ejecutas — aquí, en el navegador.', 'VibeCode 用一句话写出能运行的程序。每一行你都能读、能改、能运行——就在这里，在浏览器里。'),
    ('>Write a sentence<', '>Escribe una frase<', '>写一句话<'),
    ('>Watch one compile ↓<', '>Mira cómo se compila ↓<', '>看它编译 ↓<'),
    ('First version: the engine runs on this page. No model, no account, no network.', 'Primera versión: el motor se ejecuta en esta página. Sin modelo, sin cuenta, sin red.', '第一版：引擎就在这个页面上运行。没有模型，没有账号，没有网络。'),
    ('A sentence, compiled</h2>', 'Una frase, compilada</h2>', '一句话，编译完成</h2>'),
    ('Scripted illustration: one fixed program, step by step.', 'Ilustración guionizada: un programa fijo, paso a paso.', '预设的演示：一个固定的程序，一步一步。'),
    ('<p class="sentence" lang="en">', '<p class="sentence">', '<p class="sentence">'),
    ('<button type="button" data-k="1">Draw a ball</button>', '<button type="button" data-k="1">Dibuja una pelota</button>', '<button type="button" data-k="1">画一个球，</button>'),
    ('<button type="button" data-k="2">that falls,</button>', '<button type="button" data-k="2">que cae,</button>', '<button type="button" data-k="2">让它下落，</button>'),
    ('<button type="button" data-k="3">bounces off the floor,</button>', '<button type="button" data-k="3">rebota en el suelo</button>', '<button type="button" data-k="3">碰到地面就弹起，</button>'),
    ('<button type="button" data-k="4">and leaves a trail.</button>', '<button type="button" data-k="4">y deja una estela.</button>', '<button type="button" data-k="4">并留下一道轨迹。</button>'),
    ('aria-label="The code the sentence became"', 'aria-label="El código en que se convirtió la frase"', 'aria-label="这句话变成的代码"'),
    ('<span class="ln__say">draw a ball</span>', '<span class="ln__say">dibuja una pelota</span>', '<span class="ln__say">画一个球</span>'),
    ('<span class="ln__say">that falls</span>', '<span class="ln__say">que cae</span>', '<span class="ln__say">让它下落</span>'),
    ('<span class="ln__say">bounces off the floor</span>', '<span class="ln__say">rebota en el suelo</span>', '<span class="ln__say">碰到地面就弹起</span>'),
    ('<span class="ln__say">and leaves a trail</span>', '<span class="ln__say">y deja una estela</span>', '<span class="ln__say">留下一道轨迹</span>'),
    ('data-empty="// nothing written yet"', 'data-empty="// todavía no hay nada escrito"', 'data-empty="// 还什么都没写"'),
    ('aria-label="The program as far as it is written: a ball that falls, bounces and leaves a trail"', 'aria-label="El programa hasta donde está escrito: una pelota que cae, rebota y deja una estela"', 'aria-label="写到哪里就运行到哪里的程序：一个下落、弹起并留下轨迹的球"'),
    ('<span data-step-label>Step 0 of 4</span> — the canvas runs the lines written so far.', '<span data-step-label>Paso 0 de 4</span> — el lienzo ejecuta las líneas escritas hasta ahora.', '<span data-step-label>第 0 步，共 4 步</span>——画布运行目前写好的几行。'),
    ('fig. 2 — a proof sheet, one line marked. Generated (fal), not a photograph.', 'fig. 2 — una prueba de imprenta, una línea marcada. Generado (fal), no es una fotografía.', '图 2 — 一张校样，标出了一行。生成图像（fal），不是照片。'),
    ('<h2 id="read-title">Read every line.</h2>', '<h2 id="read-title">Lee cada línea.</h2>', '<h2 id="read-title">每一行都读。</h2>'),
    ('// the code sits beside what it does. nothing hides in a service.', '// el código está junto a lo que hace. nada se esconde en un servicio.', '// 代码就在它做的事旁边。没有什么藏在服务里。'),
    ('Write one sentence.</h2>', 'Escribe una frase.</h2>', '写一句话。</h2>'),
    ('<p>VibeCode writes the program, shows you the code, and runs it.</p>', '<p>VibeCode escribe el programa, te muestra el código y lo ejecuta.</p>', '<p>VibeCode 写出程序，给你看代码，然后运行它。</p>'),
    ('>Your sentence<', '>Tu frase<', '>你的一句话<'),
    ('placeholder="a bouncing ball"', 'placeholder="una pelota que rebota"', 'placeholder="一个弹跳的球"'),
    ('aria-label="Examples"><span>Try</span>', 'aria-label="Ejemplos"><span>Prueba</span>', 'aria-label="示例"><span>试试</span>'),
    ('<button type="button" data-example="a bouncing ball">a bouncing ball</button>', '<button type="button" data-example="una pelota que rebota">una pelota que rebota</button>', '<button type="button" data-example="一个弹跳的球">一个弹跳的球</button>'),
    ('<button type="button" data-example="a clock">a clock</button>', '<button type="button" data-example="un reloj">un reloj</button>', '<button type="button" data-example="一个时钟">一个时钟</button>'),
    ('<button type="button" data-example="a bar chart of 12, 19, 15, 27, 22, 34">a bar chart</button>', '<button type="button" data-example="un gráfico de barras de 12, 19, 15, 27, 22, 34">un gráfico</button>', '<button type="button" data-example="一个柱状图，数据是 12, 19, 15, 27, 22, 34">一个柱状图</button>'),
    ('<button type="button" data-example="a starfield">a starfield</button>', '<button type="button" data-example="un campo de estrellas">estrellas</button>', '<button type="button" data-example="一片星空">一片星空</button>'),
    ('<button type="button" data-example="a sine wave">a wave</button>', '<button type="button" data-example="una onda">una onda</button>', '<button type="button" data-example="一道波">一道波</button>'),
    ('<button type="button" data-example="fireworks">fireworks</button>', '<button type="button" data-example="fuegos artificiales">fuegos artificiales</button>', '<button type="button" data-example="烟花">烟花</button>'),
    ('>Write the code<', '>Escribe el código<', '>写出代码<'),
    ('<b>Recipes, not a model.</b> This first version picks one of six recipes from the words you write, or draws your words. The engine is small, local and readable: <code>app/recipes.mjs</code>. The product will write new programs.', '<b>Recetas, no un modelo.</b> Esta primera versión elige una de seis recetas según las palabras que escribes, o dibuja tus palabras. El motor es pequeño, local y legible: <code>app/recipes.mjs</code>. El producto escribirá programas nuevos.', '<b>是配方，不是模型。</b>这一版根据你写的词从六份配方里选一份，或者把你的话画出来。引擎很小、在本地、可读：<code>app/recipes.mjs</code>。真正的产品会写出新的程序。'),
    ('<button id="copy" type="button">copy</button>', '<button id="copy" type="button">copiar</button>', '<button id="copy" type="button">复制</button>'),
    ('<button id="run" type="button">run</button>', '<button id="run" type="button">ejecutar</button>', '<button id="run" type="button">运行</button>'),
    ('<button id="reset" type="button">reset</button>', '<button id="reset" type="button">reiniciar</button>', '<button id="reset" type="button">重置</button>'),
    ('aria-label="The program\'s code"', 'aria-label="El código del programa"', 'aria-label="程序的代码"'),
    ('title="The program\'s output"', 'title="El resultado del programa"', 'title="程序的输出"'),
    ('Three proofs, one loop.</h2>', 'Tres pruebas, un ciclo.</h2>', '三张校样，一个循环。</h2>'),
    ('<span class="s">Describe.</span>', '<span class="s">Describe.</span>', '<span class="s">描述。</span>'),
    ('<p>In your own words: English, Spanish or Chinese.</p>', '<p>Con tus palabras: en inglés, español o chino.</p>', '<p>用你自己的话：英文、西班牙文或中文。</p>'),
    ('<span class="s">Read.</span>', '<span class="s">Lee.</span>', '<span class="s">阅读。</span>'),
    ('<p>The program appears as code beside its output, short and commented.</p>', '<p>El programa aparece como código junto a su resultado, corto y comentado.</p>', '<p>程序以代码的形式出现在输出旁边，很短，带注释。</p>'),
    ('<span class="s">Run and change.</span>', '<span class="s">Ejecuta y cambia.</span>', '<span class="s">运行并修改。</span>'),
    ('<p>Edit a line, run it again, keep what works. Copy it out: it is one plain HTML file.</p>', '<p>Cambia una línea, ejecútalo otra vez, quédate con lo que funciona. Cópialo: es un solo archivo HTML.</p>', '<p>改一行，再运行一次，留下有用的部分。把它复制出来：它就是一个普通的 HTML 文件。</p>'),
    ('fig. 3 — ink in cotton paper. Generated (fal), not a photograph.', 'fig. 3 — tinta en papel de algodón. Generado (fal), no es una fotografía.', '图 3 — 渗进棉纸的墨水。生成图像（fal），不是照片。'),
    ('<h2 id="sandbox-title">Nothing leaves the page.</h2>', '<h2 id="sandbox-title">Nada sale de la página.</h2>', '<h2 id="sandbox-title">什么都不会离开这个页面。</h2>'),
    ('<p>The program runs in <code>&lt;iframe sandbox="allow-scripts"&gt;</code>: no network, no access to this page. The page sends nothing after it loads.</p>', '<p>El programa corre en <code>&lt;iframe sandbox="allow-scripts"&gt;</code>: sin red, sin acceso a esta página. La página no envía nada después de cargar.</p>', '<p>程序在 <code>&lt;iframe sandbox="allow-scripts"&gt;</code> 里运行：没有网络，碰不到这个页面。页面加载之后不发送任何东西。</p>'),
    ('Three weights.</h2>', 'Tres pesos.</h2>', '三种字重。</h2>'),
    ('<p>One tool, set heavier for more people.</p>', '<p>Una herramienta, más pesada para más personas.</p>', '<p>同一个工具，人越多，字越重。</p>'),
    ('<h3>Free</h3>', '<h3>Gratis</h3>', '<h3>免费</h3>'),
    ('<ul><li>The demo on this page</li><li>Every kind of program</li><li>Code you can copy and keep</li></ul>', '<ul><li>La demo de esta página</li><li>Todos los tipos de programa</li><li>Código que puedes copiar y guardar</li></ul>', '<ul><li>这个页面上的演示</li><li>所有种类的程序</li><li>可以复制和保存的代码</li></ul>'),
    ('>Open the demo<', '>Abrir la demo<', '>打开演示<'),
    ('<h3>Team</h3>', '<h3>Equipo</h3>', '<h3>团队</h3>'),
    ('<p class="weight__price">Priced at launch</p>', '<p class="weight__price">Precio al lanzar</p>', '<p class="weight__price">发布时定价</p>'),
    ('<ul><li>Programs written from your own description</li><li>Shared workspaces</li><li>Your repository, your code</li></ul>', '<ul><li>Programas escritos a partir de tu propia descripción</li><li>Espacios de trabajo compartidos</li><li>Tu repositorio, tu código</li></ul>', '<ul><li>根据你自己的描述写程序</li><li>共享工作区</li><li>你的仓库，你的代码</li></ul>'),
    ('>Ask for early access<', '>Pide acceso anticipado<', '>申请提前使用<'),
    ('<h3>Enterprise</h3>', '<h3>Empresa</h3>', '<h3>企业</h3>'),
    ('<ul><li>Your own model and cloud</li><li>Review before any code ships</li><li>A support agreement</li></ul>', '<ul><li>Tu propio modelo y tu nube</li><li>Revisión antes de publicar código</li><li>Un acuerdo de soporte</li></ul>', '<ul><li>你自己的模型和云</li><li>代码发布前先审阅</li><li>一份支持协议</li></ul>'),
    ('>Talk to us<', '>Habla con nosotros<', '>联系我们<'),
    ('No price is set yet. The owner prices and launches each plan. Nothing on this page takes a payment.', 'Todavía no hay precio. El dueño fija el precio y lanza cada plan. Nada en esta página cobra un pago.', '现在还没有价格。每个方案由所有者定价并发布。这个页面不收任何付款。'),
    ('§8</span> Notes</h2>', '§8</span> Notas</h2>', '§8</span> 注释</h2>'),
    ('Does this page call a model?</summary><p>No. The first version runs a small engine in your browser. It picks one of six recipes by the words you write. The product\'s next version calls a model through our API, never from a browser key.</p>', '¿Esta página llama a un modelo?</summary><p>No. La primera versión ejecuta un motor pequeño en tu navegador. Elige una de seis recetas según las palabras que escribes. La siguiente versión del producto llamará a un modelo a través de nuestra API, nunca con una clave en el navegador.</p>', '这个页面会调用模型吗？</summary><p>不会。第一版在你的浏览器里运行一个小引擎，根据你写的词从六份配方里选一份。产品的下一版会通过我们的 API 调用模型，绝不在浏览器里放密钥。</p>'),
    ('Does my code leave this page?</summary><p>No. The page sends nothing after it loads. The program runs in a sandboxed frame with no network.</p>', '¿Mi código sale de esta página?</summary><p>No. La página no envía nada después de cargar. El programa corre en un marco aislado y sin red.</p>', '我的代码会离开这个页面吗？</summary><p>不会。页面加载之后不发送任何东西。程序在有沙箱、没有网络的框架里运行。</p>'),
    ('Can I keep what it writes?</summary><p>Yes. Copy the code and save it as an HTML file. It runs on any browser, offline.</p>', '¿Puedo quedarme con lo que escribe?</summary><p>Sí. Copia el código y guárdalo como un archivo HTML. Funciona en cualquier navegador, sin conexión.</p>', '我能留下它写的东西吗？</summary><p>可以。复制代码，保存成 HTML 文件。它在任何浏览器里都能离线运行。</p>'),
    ('Who makes VibeCode?</summary><p>VibeCode is a company of CommandAGI. Write to', '¿Quién hace VibeCode?</summary><p>VibeCode es una empresa de CommandAGI. Escribe a', '谁做 VibeCode？</summary><p>VibeCode 是 CommandAGI 旗下的一家公司。写信到'),
    ('<p><i>Colophon.</i> Set in EB Garamond and Commit Mono. The film is generated with fal: studies of type, paper and ink, not photographs of anyone\'s work.</p>', '<p><i>Colofón.</i> Compuesto en EB Garamond y Commit Mono. Las imágenes en movimiento están generadas con fal: estudios de tipos, papel y tinta, no fotografías del trabajo de nadie.</p>', '<p><i>版权页。</i>正文用 EB Garamond 和 Commit Mono 排成。影像由 fal 生成：铅字、纸和墨水的习作，不是任何人工作的照片。</p>'),
    ('<p>Code by description. A company of CommandAGI. <a', '<p>Código a partir de una descripción. Una empresa de CommandAGI. <a', '<p>用描述写代码。CommandAGI 旗下公司。<a'),
    ('aria-label="This site"', 'aria-label="Este sitio"', 'aria-label="本站"'),
    ('<a href="#how">How it works</a>', '<a href="#how">Cómo funciona</a>', '<a href="#how">如何工作</a>'),
    ('© 2026 VibeCode, a company of CommandAGI.', '© 2026 VibeCode, una empresa de CommandAGI.', '© 2026 VibeCode，CommandAGI 旗下公司。'),
    ('aria-label="Language" title="Language"', 'aria-label="Idioma" title="Idioma"', 'aria-label="语言" title="语言"'),
    ('aria-label="Languages"', 'aria-label="Idiomas"', 'aria-label="语言"'),
    ('<h2 id="lang-title">Language</h2>', '<h2 id="lang-title">Idioma</h2>', '<h2 id="lang-title">语言</h2>'),
    ('aria-label="Close"', 'aria-label="Cerrar"', 'aria-label="关闭"'),
]

LANG_LIST = {
    'es': '''<li><a href="../" hreflang="en"><span lang="en">English</span></a></li>
            <li><a href="./" hreflang="es" aria-current="true"><span lang="es">Español</span><span class="lang-list__check" aria-hidden="true">✓</span></a></li>
            <li><a href="../zh-Hans/" hreflang="zh-Hans"><span lang="zh-Hans">简体中文</span></a></li>''',
    'zh-Hans': '''<li><a href="../" hreflang="en"><span lang="en">English</span></a></li>
            <li><a href="../es/" hreflang="es"><span lang="es">Español</span></a></li>
            <li><a href="./" hreflang="zh-Hans" aria-current="true"><span lang="zh-Hans">简体中文</span><span class="lang-list__check" aria-hidden="true">✓</span></a></li>''',
}
NOSCRIPT = {
    'es': '<a href="../" hreflang="en">English</a><a href="./" hreflang="es">Español</a><a href="../zh-Hans/" hreflang="zh-Hans">简体中文</a>',
    'zh-Hans': '<a href="../" hreflang="en">English</a><a href="../es/" hreflang="es">Español</a><a href="./" hreflang="zh-Hans">简体中文</a>',
}

def build(lang, col):
    html = en
    for row in T:
        if row[0] not in html and row[0] not in en:
            raise SystemExit(f'{lang}: not in index.html: {row[0][:70]}')
        html = html.replace(row[0], row[col])
    html = html.replace('<html lang="en">', f'<html lang="{lang}">')
    html = re.sub(r'<ul class="lang-list">.*?</ul>', lambda m: f'<ul class="lang-list">\n            {LANG_LIST[lang]}\n          </ul>', html, flags=re.S)
    html = re.sub(r'(<nav class="lang-links" aria-label="[^"]*">).*?(</nav>)', lambda m: m.group(1) + NOSCRIPT[lang] + m.group(2), html, flags=re.S)
    # Every local path one folder up; the language links above are already right.
    html = re.sub(r'(href|src|srcset)="(?!https?:|mailto:|#|\.\./|\./|data:)([^"]+)"', r'\1="../\2"', html)
    html = html.replace('href="./" aria-label="VibeCode', 'href="../" aria-label="VibeCode')
    html = html.replace('<use href="wordmark.svg#w"/>', '<use href="../wordmark.svg#w"/>')
    (root / lang / 'index.html').write_text(html)

build('es', 1)
build('zh-Hans', 2)
print('es, zh-Hans')
