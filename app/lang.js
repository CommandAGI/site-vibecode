// The footer's language button, the mechanism of CommandAGI's public sites (sites/build/client/lang.js): the button opens
// the language dialog through invoker commands where the browser has them, and this script does the same where it does
// not, with the focus trap the dialog would otherwise give and a click outside that closes it.
!function (r, y) {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        addEventListener('scroll', function () {
            var n = scrollY, s = n > y && n > 80 ? 'down' : 'up';
            if (r.dataset.scroll !== s) r.dataset.scroll = s;
            y = n;
        }, { passive: true });
}(document.documentElement, 0);

document.addEventListener('DOMContentLoaded', function () {
    try {
        var d = document, key = 'vibecode.lang', m = d.getElementById('lang-dialog');
        var remember = function () { try { localStorage.setItem(key, 1); } catch (x) { /* storage off */ } };
        if (!m) return;
        if (!('commandForElement' in HTMLButtonElement.prototype))
            d.querySelectorAll('[commandfor=lang-dialog]').forEach(function (b) {
                b.addEventListener('click', function () { m.showModal(); });
            });
        m.addEventListener('click', function (e) { if (e.target == m) m.close(); });
        m.addEventListener('keydown', function (e) {
            if (e.key != 'Tab') return;
            var f = m.querySelectorAll('a,button'), a = f[0], z = f[f.length - 1];
            if (d.activeElement == (e.shiftKey ? a : z)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); }
        });
        m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', remember); });
        // The visitor's own language wins once they have chosen one: the choice is only remembered, never sent.
        try { if (localStorage.getItem(key)) return; } catch (x) { /* storage off */ }
    } catch (x) { /* no dialog on this page */ }
});
