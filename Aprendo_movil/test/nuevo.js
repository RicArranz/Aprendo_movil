/* Comprobaciones de lo último: gestos desde cualquier sitio, arrastre con el DEDO (touch), deshacer, tildes, buscar en Ajustes, brillo. */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); else console.log('✔ ' + m); if (!c) console.log('✘ ' + m); };
(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  for (const v of [{ n: 'android', st: { os: 'android' } }, { n: 'ios-notch', st: { os: 'ios', iosHome: 'notch' } }, { n: 'ios-btn', st: { os: 'ios', iosHome: 'button' } }]) {
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(s => localStorage.setItem('aprendoMovil.v1', JSON.stringify(Object.assign({ done: {}, pos: {}, fs: 20 }, s))), v.st);
    await page.goto(URL + '#/m/1/6'); await page.waitForTimeout(500);
    const wait = ms => page.waitForTimeout(ms);
    const ev = f => page.evaluate(f);
    const cen = async sel => page.evaluate(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height }; }, sel);
    const touch = async (pts, holdFirst = 0) => {      // pts: [{x,y},...]
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
      if (holdFirst) await wait(holdFirst);
      for (const p of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [p] }); await wait(20); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(200);
    };
    const line = (a, b, n = 12) => Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n }));
    await ev(() => { const p = AM.current.phone; p.freeApps = true; p.setScene('home'); });
    await ev(() => window.scrollTo(0, document.body.scrollHeight)); await wait(200);
    const body = await cen('.p-body');
    // 1) abrir el panel desde el MEDIO de la pantalla de inicio
    const mid = { x: body.x + (v.n === 'ios-notch' ? 80 : 0), y: body.y };
    const start = v.n === 'android' ? { x: body.x, y: body.t + 300 } : v.n === 'ios-notch' ? { x: body.l + body.w * 0.8, y: body.t + 300 } : { x: body.x, y: body.t + body.h - 200 };
    const end = v.n === 'ios-btn' ? { x: start.x, y: start.y - 140 } : { x: start.x, y: start.y + 140 };
    await touch(line(start, end));
    ok(await ev(() => !!AM.current.phone.panel), v.n + ': el panel se abre arrastrando desde la mitad de la pantalla');
    // 2) cerrarlo arrastrando desde la mitad (arriba; en iPhone con botón, abajo también)
    const c2s = { x: body.x, y: body.t + body.h * 0.8 };
    await touch(line(c2s, { x: c2s.x, y: c2s.y - 140 }));
    ok(await ev(() => !AM.current.phone.panel), v.n + ': el panel se cierra arrastrando hacia arriba');
    if (v.n === 'ios-btn') {
      await touch(line(start, end)); await touch(line({ x: body.x, y: body.t + body.h * 0.45 }, { x: body.x, y: body.t + body.h * 0.45 + 140 }));
      ok(await ev(() => !AM.current.phone.panel), v.n + ': el centro de control también se cierra hacia abajo');
      await touch(line(start, end)); await touch(line({ x: body.x, y: body.t + body.h - 14 }, { x: body.x, y: body.t + body.h - 160 }));
      ok(await ev(() => !AM.current.phone.panel), v.n + ': se cierra desde el borde de abajo');
    }
    // 3) mover y crear carpeta con el dedo
    await ev(() => { AM.current.phone.setScene('home'); });
    let a = await cen('.hm-grid [data-app="notas"]'), b = await cen('.hm-grid [data-app="reloj"]');
    await touch([{ x: a.x, y: a.y }].concat(line({ x: a.x, y: a.y }, { x: b.x + 6, y: b.y + 6 }, 10)), 600);
    ok(await ev(() => AM.current.phone.layout.slots.some(s => s && s.folder && s.apps.includes('notas') && s.apps.includes('reloj'))), v.n + ': carpeta creada con el dedo');
    a = await cen('.hm-grid [data-app="fotos"]'); b = await cen('[data-slot="17"]');
    await touch([{ x: a.x, y: a.y }].concat(line({ x: a.x, y: a.y }, { x: b.x, y: b.y }, 10)), 600);
    ok(await ev(() => !!AM.current.phone.layout.slots[17]), v.n + ': app movida con el dedo');
    // 4) desinstalar y deshacer
    await ev(() => { const p = AM.current.phone; p.uninstall('radio'); });
    ok(await ev(() => !AM.current.phone.layout.slots.some(s => s && s.app === 'radio')), v.n + ': app desinstalada');
    await page.click('.p-snack b'); await wait(200);
    ok(await ev(() => AM.current.phone.layout.slots.some(s => s && s.app === 'radio')), v.n + ': "Deshacer" la devuelve');
    // 5) brillo
    await ev(() => AM.current.phone.setBright(15));
    ok(await ev(() => /brightness\(0\.[3-6]/.test(document.querySelector('.p-body').style.filter)), v.n + ': el brillo bajo oscurece la pantalla');
    await ev(() => AM.current.phone.setBright(100));
    ok(await ev(() => /brightness\(1\.[2-5]/.test(document.querySelector('.p-body').style.filter)), v.n + ': el brillo alto aclara la pantalla');
    // 6) buscar en ajustes
    await ev(() => { const p = AM.current.phone; p.setBright(70); p.setScene('settings'); p.setValue('q', 'brillo'); p.filterSettings('brillo'); });
    ok(await ev(() => [...document.querySelectorAll('.sett .row[data-k]')].filter(r => !r.hidden).length === 1), v.n + ': Ajustes filtra al escribir «brillo»');
    // 7) tildes con el dedo
    await ev(() => { const p = AM.current.phone; p.setScene('notes'); p.focus('note'); });
    const ik = await cen('.p-kbd .k[data-kid="i"]');
    await touch([{ x: ik.x, y: ik.y }], 600);
    ok(await page.$('.acc-i') !== null, v.n + ': al mantener la «i» salen las tildes');
    const ai = await cen('.acc-i'); await page.touchscreen.tap(ai.x, ai.y); await wait(150);
    ok(await ev(() => AM.current.phone.getValue('note') === 'í'.toLocaleUpperCase('es') || AM.current.phone.getValue('note') === 'Í'), v.n + ': se escribe la tilde (Í con mayúscula inicial)');
    ok(errs.length === 0, v.n + ': sin errores de consola ' + errs.join('|'));
    await ctx.close();
  }
  await browser.close();
  console.log(fails.length ? '\nFALLOS:\n' + fails.join('\n') : '\nTodo correcto'); process.exit(fails.length ? 1 : 0);
})();
