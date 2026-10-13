/* Capturas de lo nuevo (inicio editable, recientes, editor del panel, copiar/pegar). Uso: node test/capturas2.js carpeta */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const out = process.argv[2] || 'shots';
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  for (const v of [{ n: 'and', st: { os: 'android' } }, { n: 'ios', st: { os: 'ios', iosHome: 'notch' } }]) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    await page.addInitScript(s => localStorage.setItem('aprendoMovil.v1', JSON.stringify(Object.assign({ done: {}, pos: {}, fs: 20 }, s))), v.st);
    await page.goto(URL + '#/m/1/6'); await page.waitForTimeout(500);
    const shot = async n => { await page.waitForTimeout(400); await (await page.$('#stagebox')).screenshot({ path: `${out}/${v.n}-${n}.png` }); };
    const ev = f => page.evaluate(f);
    const cen = async sel => page.evaluate(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
    await ev(() => { const p = AM.current.phone; p.freeApps = true; p.setScene('home'); });
    await shot('h1-home');
    let c = await cen('.hm-grid [data-app="solitario"]'); await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.waitForTimeout(700);
    await shot('h2-menu'); await page.mouse.up();
    await ev(() => { const p = AM.current.phone; p.closeLayer(); p.confirmUninstall('solitario'); });
    await shot('h3-dialog');
    await ev(() => { const p = AM.current.phone; p.closeLayer(); const S = p.layout.slots; S[4] = { folder: true, name: '', apps: ['reloj', 'notas', 'correo'] }; S[2] = null; S[3] = null; p.renderHome(); p.openFolder(4); });
    await shot('h4-folder');
    await ev(() => { const p = AM.current.phone; p.startRename(); });
    await shot('h5-rename');
    await ev(() => { const p = AM.current.phone; p.hideKb(); p.closeFolder(); p.setScene('browser'); p.preload(['notas', 'fotos']); p.showRecents(); });
    await shot('r1-recents');
    await ev(() => { const p = AM.current.phone; p.setScene('chat', { msgs: ['Mi dirección nueva es Calle Real 25, Toledo. Llámame al 600 111 222.'] }); });
    c = await page.evaluate(() => { const w = [...document.querySelectorAll('.bub .w')].find(x => /Calle/.test(x.textContent)); const r = w.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.waitForTimeout(250); await shot('c0-ring'); await page.waitForTimeout(400); await page.mouse.up();
    await ev(() => { const p = AM.current.phone; const ws = p.sel.box.querySelectorAll('.w'); p.sel.b = ws.length - 3; p.paintSel(); });
    await shot('c1-select');
    await ev(() => { const p = AM.current.phone; p.clearSel(); p.clip = { type: 'image', emoji: '🐶', color: '#fde68a' }; p.pasteInto('msg'); p.focus('msg'); });
    await shot('c2-attach');
    await ev(() => { const p = AM.current.phone; p.setScene('home'); p.resetState && 0; p.openPanel(p.os === 'android' ? 'qs' : 'cc', p.os === 'android' ? 2 : 1, true); if (p.os === 'android') { p.qsList = ['captura', 'wifi', 'data', 'bt', 'torch', 'rot', 'air', 'dnd', 'saver', 'loc', 'nfc']; p.renderPanel(); } else { p.ccList = ['grab', 'torch', 'timer', 'calc', 'cam', 'nfc']; p.renderPanel(); } });
    await shot('q1-panel');
    if (v.n === 'and') { await ev(() => { const p = AM.current.phone; p.qsList = ['captura', 'wifi', 'data', 'bt', 'torch', 'rot', 'air', 'dnd', 'saver', 'loc']; p.openQsEdit(); }); await shot('q2-edit'); }
    else { await ev(() => { const p = AM.current.phone; p.closePanel(true); p.setScene('ccsettings'); p.ccList = ['grab', 'torch', 'timer', 'calc', 'cam']; p.renderScene('ccsettings', {}); }); await shot('q2-ccsettings'); }
    await page.close();
  }
  await browser.close();
})();
