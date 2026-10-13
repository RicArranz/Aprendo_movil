/* Capturas del móvil simulado en distintos estados para revisarlo a ojo. Uso: node test/capturas.js carpeta */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const out = process.argv[2] || 'shots';
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  for (const v of [{ n: 'and', st: { os: 'android' } }, { n: 'ios', st: { os: 'ios', iosHome: 'notch' } }, { n: 'iosb', st: { os: 'ios', iosHome: 'button' } }]) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    await page.addInitScript(s => localStorage.setItem('aprendoMovil.v1', JSON.stringify(Object.assign({ done: {}, pos: {}, fs: 20 }, s))), v.st);
    await page.goto(URL + '#/m/1/6'); await page.evaluate(() => { AM.slow = 0.01; });
    await page.waitForTimeout(400);
    const shot = async n => { await page.waitForTimeout(350); await (await page.$('#stagebox')).screenshot({ path: `${out}/${v.n}-${n}.png` }); };
    const ev = f => page.evaluate(f);
    await ev(() => { const p = AM.current.phone; p.setScene('chat'); p.focus('msg'); });
    await ev(() => { const p = AM.current.phone; p.kb.cancelDemo(); p.setValue('msg', 'Hola, tengo 70'); p.kb.render(); });
    await shot('1-chat-kbd');
    await ev(() => { const p = AM.current.phone; p.kb.press(p.os === 'ios' ? 'num' : 'sym'); });
    await shot('2-num');
    await ev(() => { const p = AM.current.phone; p.kb.press(p.os === 'ios' ? 'sym' : 'sym2'); });
    await shot('3-sym');
    await ev(() => { const p = AM.current.phone; p.setScene('form', { }); p.focus('tel'); });
    await shot('4-tel');
    await ev(() => { const p = AM.current.phone; p.setScene('mail'); p.focus('to'); });
    await shot('5-mail');
    await ev(() => { const p = AM.current.phone; p.setScene('home'); p.openPanel(p.os === 'android' ? 'qs' : 'cc', 1, true); });
    await shot('6-panel1');
    if (v.n === 'and') { await ev(() => AM.current.phone.openPanel('qs', 2, true)); await shot('7-panel2'); }
    await ev(() => { const p = AM.current.phone; p.closePanel(true); p.setScene('home'); });
    await shot('8-home');
    await ev(() => { const p = AM.current.phone; p.setScene('settings'); });
    await shot('9-settings');
    await ev(() => { const p = AM.current.phone; p.setScene('gallery'); });
    await shot('a-gallery');
    await ev(() => { const p = AM.current.phone; p.setScene('form', { long: true, only: ['comment'] }); });
    await shot('b-form');
    await ev(() => { const p = AM.current.phone; p.setScene('notes'); p.focus('note'); });
    await shot('c-notes');
    await ev(() => { const p = AM.current.phone; p.setScene('browser'); p.set({ torch: true, bt: true }); });
    await shot('d-browser-torch');
    await page.close();
  }
  await browser.close();
})();
