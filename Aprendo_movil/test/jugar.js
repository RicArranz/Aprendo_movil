/* Prueba de humo: juega TODOS los ejercicios con ratón de verdad (Android, iPhone con botón, iPhone sin botón).
   Uso:  CHROME_PATH=/ruta/chrome node test/jugar.js [carpeta_capturas]    (necesita playwright, p. ej. /root/rp/node_modules)
   Con W=390 H=844 prueba el tamaño de un móvil. */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const shotDir = process.argv[2] || null;
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async () => {
  const browser = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const errors = [];
  const variants = [
    { name: 'android', st: { os: 'android', iosHome: null } },
    { name: 'ios-sin-boton', st: { os: 'ios', iosHome: 'notch' } },
    { name: 'ios-con-boton', st: { os: 'ios', iosHome: 'button' } }
  ];
  for (const v of variants) {
    const page = await browser.newPage({ viewport: { width: +(process.env.W || 1366), height: +(process.env.H || 768) } });
    page.on('pageerror', e => errors.push(v.name + ' pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(v.name + ' console: ' + m.text()); });
    await page.addInitScript(s => { localStorage.setItem('aprendoMovil.v1', JSON.stringify(Object.assign({ done: {}, pos: {}, fs: 20, sound: false }, s))); }, v.st);
    await page.goto(URL);
    await page.evaluate(() => { AM.slow = 0.05; });
    const A = v.st.os === 'android';
    const wait = ms => page.waitForTimeout(ms);
    const center = async sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; }, sel);
    const click = async sel => { const c = await center(sel); if (!c) throw new Error('no hay ' + sel); await page.mouse.click(c.x, c.y); await wait(60); };
    const drag = async (from, to) => {
      await page.mouse.move(from.x, from.y); await page.mouse.down();
      for (let k = 1; k <= 10; k++) { await page.mouse.move(from.x + (to.x - from.x) * k / 10, from.y + (to.y - from.y) * k / 10); await wait(10); }
      await page.mouse.up(); await wait(80);
    };
    const state = () => page.evaluate(() => { const c = AM.current; if (!c) return null; const t = c.task(); return { step: c.step().title, si: c.si(), ti: c.ti(), done: c.done(), demoing: c.demoing(), type: t.type ? { field: t.type.field, target: t.type.target } : null, want: t.want || null, hint: t.hint || null, scene: t.scene }; });
    const celeText = () => page.evaluate(() => { const c = document.getElementById('cele'); return c && !c.hidden ? c.textContent : null; });
    const kbType = async (field, target) => {
      for (let n = 0; n < 120; n++) {
        const fid = await page.evaluate(() => AM.current.phone.fid);
        if (fid !== field) { await click('[data-fid="' + field + '"]'); }
        const k = await page.evaluate(t => AM.current.phone.kb.nextKey(t), target);
        if (!k) return;
        if (k.indexOf('acc:') === 0) {
          const kc = await page.evaluate(kk => { const e = AM.current.phone.kb.keyEl(kk); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, k);
          await page.mouse.move(kc.x, kc.y); await page.mouse.down(); await wait(600); await page.mouse.up(); await wait(100);
          const ic = await page.evaluate(ch => { const e = [...document.querySelectorAll('.acc-i')].find(x => x.dataset.ch === ch); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, k.slice(4));
          if (!ic) throw new Error('no sale la tilde ' + k);
          await page.mouse.click(ic.x, ic.y); await wait(60); continue;
        }
        const c = await page.evaluate(kid => { const e = [...document.querySelectorAll('.p-kbd .k')].find(x => x.dataset.kid === kid); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, k);
        if (!c) throw new Error('tecla no encontrada: ' + k + ' para ' + target);
        await page.mouse.click(c.x, c.y); await wait(25);
      }
      throw new Error('no consigue escribir ' + target);
    };
    const swipe = async kind => {
      const d = 130;
      if (kind === 'top') { const c = await center(A ? '.e-top' : (v.name === 'ios-con-boton' ? '.e-top' : '.e-topR')); await drag({ x: c.x, y: c.t + 8 }, { x: c.x, y: c.t + 8 + d }); }
      else { const b = await center('.p-body'); await drag({ x: b.x, y: b.t + b.h - 14 }, { x: b.x, y: b.t + b.h - 14 - d }); }
    };

    const BTN = v.name === 'ios-con-boton', NOTCH = v.name === 'ios-sin-boton';
    const cen = async sel => { const c = await center(sel); if (!c) throw new Error('no hay ' + sel); return c; };
    const press = async (sel, ms = 650) => { const c = await cen(sel); await page.mouse.move(c.x, c.y); await page.mouse.down(); await wait(ms); await page.mouse.up(); await wait(120); };
    const pressAt = async (c, ms = 650) => { await page.mouse.move(c.x, c.y); await page.mouse.down(); await wait(ms); await page.mouse.up(); await wait(120); };
    const dragLP = async (from, to, lp = 650) => {
      const a = await cen(from), b = await cen(to);
      await page.mouse.move(a.x, a.y); await page.mouse.down(); await wait(lp);
      for (let k = 1; k <= 12; k++) { await page.mouse.move(a.x + (b.x - a.x) * k / 12, a.y + (b.y - a.y) * k / 12); await wait(15); }
      await page.mouse.up(); await wait(150);
    };
    const wordC = async (boxSel, re) => page.evaluate(([bs, src]) => { const r = new RegExp(src); const w = [...document.querySelectorAll(bs + ' .w')].find(x => r.test(x.textContent)); if (!w) return null; const b = w.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, [boxSel, re.source]);
    const scaleOf = () => page.evaluate(() => AM.current.phone.scale);
    const selectRange = async (boxSel, from, to) => {
      const a = await wordC(boxSel, from); await pressAt(a);
      const h = await cen('.sel-h[data-h="b"]'), b = await wordC(boxSel, to), sc = await scaleOf();
      await page.mouse.move(h.x, h.y); await page.mouse.down();
      for (let k = 1; k <= 10; k++) { await page.mouse.move(h.x + (b.x - h.x) * k / 10, h.y + (b.y + 14 * sc - h.y) * k / 10); await wait(15); }
      await page.mouse.up(); await wait(120);
    };
    const ensureVisible = async sel => {
      for (let n = 0; n < 4; n++) {
        const c = await cen(sel), r = await cen('.p-recents');
        if (c.x < r.x + r.w / 2 - 20) break;
        await drag({ x: r.x + 40, y: c.y }, { x: r.x - 120, y: c.y });
      }
    };
    const goHome = async () => {
      if (A) return click('.nb-home'); if (BTN) return click('.p-hw');
      const b = await cen('.p-body'); return drag({ x: b.x, y: b.t + b.h - 14 }, { x: b.x, y: b.t + b.h - 200 });
    };
    const goRecents = async () => {
      if (A) return click('.nb-rec');
      if (BTN) { const c = await cen('.p-hw'); await page.mouse.click(c.x, c.y); await wait(80); await page.mouse.click(c.x, c.y); return wait(150); }
      const c = await cen('.p-body'); await page.mouse.move(c.x, c.t + c.h - 14); await page.mouse.down();
      for (let k = 1; k <= 10; k++) { await page.mouse.move(c.x, c.t + c.h - 14 - 15 * k); await wait(10); }
      await wait(600); await page.mouse.up(); await wait(150);
    };
    const pasteViaMenu = async sel => { await press(sel); await wait(250); const m = await page.evaluate(() => { const e = [...document.querySelectorAll('.p-menu .mi')].find(x => /^Pegar/.test(x.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); if (!m) throw new Error('no sale Pegar'); await page.mouse.click(m.x, m.y); await wait(100); };
    const menuItem = async re => { const m = await page.evaluate(src => { const r0 = new RegExp(src); const e = [...document.querySelectorAll('.p-menu .mi')].find(x => r0.test(x.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, re.source); if (!m) throw new Error('no sale el menú ' + re); await page.mouse.click(m.x, m.y); await wait(120); };
    const uninstall = async id => {
      await press('.hm-grid [data-app="' + id + '"]'); await wait(200);
      await menuItem(A ? /Desinstalar/ : /Quitar app/); await wait(150);
      if (A) await click('.db.pri'); else { await click('.db.red'); await wait(150); await click('.db.red'); }
    };
    const barDrag = async (dx, dy, hold = 0) => {
      const c = await cen('.p-body'); const x0 = c.x - (dx > 0 ? 60 : 0), y0 = c.t + c.h - 14;
      await page.mouse.move(x0, y0); await page.mouse.down();
      for (let k = 1; k <= 10; k++) { await page.mouse.move(x0 + dx * k / 10, y0 + dy * k / 10); await wait(10); }
      if (hold) await wait(hold); await page.mouse.up(); await wait(150);
    };

    const solve = async s => {
      await page.evaluate(() => { if (window.innerWidth <= 820) { const b = document.getElementById('stagebox').getBoundingClientRect(); if (b.bottom > window.innerHeight || b.top < 0) window.scrollBy(0, b.bottom - window.innerHeight + 8); } });
      if (s.type) { while ((await state()).demoing) await wait(100); return kbType(s.type.field, s.type.target); }
      if (s.want) return click('[data-tile="' + s.want.name + '"]');
      const T = s.step, ti = s.ti;
      /* --- módulo 3: editar iconos --- */
      if (/Editar los iconos del panel/.test(T)) return click('[data-qs="edit"]');
      if (/captura de pantalla/.test(T)) return ti === 0 ? click('.qt[data-qt="captura"]') : dragLP('.act .qt[data-qt="captura"]', '.act .qt[data-i="0"]', 50);
      if (/datos móviles/.test(T)) return ti === 0 ? click('.qt[data-qt="data"]') : dragLP('.act .qt[data-qt="data"]', '.act .qt[data-i="2"]', 50);
      if (/NFC/.test(T) && A) return ti === 0 ? click('.qt[data-qt="nfc"]') : click('.act .qt[data-qt="nfc"] .rm');
      if (/Guardar y ver/.test(T)) return click('[data-qs="done"]');
      if (/Entrar en el modo editar/.test(T)) return click('.cc-plus');
      if (/Añadir y colocar un botón/.test(T)) return ti === 0 ? click('.cc-addbar') : ti === 1 ? click('[data-ccpick="grab"]') : dragLP('.cc-b[data-ccid="grab"]', '.cc-b[data-ccid="torch"]', 30);
      if (/lector NFC/.test(T)) return ti === 0 ? click('[data-ccpick="nfc"]') : click('.cc-b[data-ccid="nfc"] .bdg');
      if (/Terminar de editar/.test(T)) return click('.cc-ok');
      if (/Buscar algo en Ajustes/.test(T)) return click('[data-fid="q"]');
      if (/^Abrir/.test(T) || /Ver todos/.test(T)) return swipe(A || v.name !== 'ios-con-boton' ? 'top' : 'bot2');
      if (/Cerrar el panel/.test(T)) return A ? click('.nb-back') : click('.cc-tip');
      if (/brillo/.test(T)) {
        const c = await center('[data-slider="bright"]'); const f = [0.95, 0.08, 0.6][s.ti];
        const pt = A ? { x: c.l + c.w * f, y: c.y } : { x: c.x, y: c.t + c.h * (1 - f) };
        await page.mouse.click(pt.x, pt.y); return wait(60);
      }
      /* --- módulo 4: navegar y organizar --- */
      if (/^El botón Atrás|^Volver atrás/.test(T)) { if (ti === 0) return click('[data-title="Pantalla"]'); return A ? click('.nb-back') : click('[data-back]'); }
      if (/Ir a la pantalla de inicio/.test(T)) return goHome();
      if (/Ver las apps abiertas/.test(T)) return goRecents();
      if (/Cambiar de una app/.test(T)) { if (ti === 0) return click('.rc[data-id="notas"]'); await goRecents(); await wait(300); await ensureVisible('.rc[data-id="fotos"]'); return click('.rc[data-id="fotos"]'); }
      if (/Cerrar una app/.test(T)) { await ensureVisible('.rc[data-id="fotos"]'); const c = await cen('.rc[data-id="fotos"]'); return drag({ x: c.x, y: c.y }, { x: c.x, y: c.y - 260 }); }
      if (/Cerrar todas las apps/.test(T)) {
        if (A) return click('.rc-clear');
        for (let n = 0; n < 5; n++) { const c = await center('.rc'); if (!c) break; await drag({ x: c.x, y: c.y }, { x: c.x, y: c.y - 260 }); await wait(400); }
        return;
      }
      if (/Navegar con gestos/.test(T)) {
        if (ti === 0) return click('[data-title="Pantalla"]');
        if (ti === 1) { const c = await cen('.p-body'); return drag({ x: c.l + 8, y: c.y }, { x: c.l + 140, y: c.y }); }
        if (ti === 2) return barDrag(0, -140);
        if (ti === 3) return barDrag(0, -140, 600);
        return barDrag(160, 0);
      }
      if (/rayita/.test(T)) return barDrag(160, 0);
      if (/Mover una app/.test(T)) return dragLP('.hm-grid [data-app="fotos"]', '[data-slot="17"]');
      if (/Crear una carpeta/.test(T)) return dragLP('.hm-grid [data-app="notas"]', '.hm-grid [data-app="reloj"]');
      if (/Ponerle nombre/.test(T)) {
        if (ti === 0) return click('[data-folder]'); if (ti === 1) return click('.fd-t');
        await click('.p-kbd .k[data-kid="enter"]'); await wait(150); const f = await cen('.p-fold'); await page.mouse.click(f.l + 20, f.t + f.h - 120); return wait(100);
      }
      if (/Meter otra app/.test(T)) return dragLP('.hm-grid [data-app="correo"]', '.hm-grid [data-folder]');
      if (/Desinstalar una app|Eliminar una app/.test(T)) return uninstall('solitario');
      if (/ordena tu móvil/.test(T)) return ti === 0 ? uninstall('radio') : dragLP('.hm-grid [data-app="mapas"]', '.hm-grid [data-app="tiempo"]');
      /* --- módulo 5: copiar y pegar --- */
      if (/Elegir una palabra/.test(T)) return pressAt(await wordC('.bub', /Toledo/));
      if (/Elegir la dirección/.test(T)) return ti === 0 ? selectRange('.bub', /Calle/, /Toledo/) : click('[data-sa="copy"]');
      if (/Pegar en otra app/.test(T)) {
        if (ti === 0) return goHome(); if (ti === 1) return click('[data-app="notas"]'); if (ti === 2) return click('[data-fid="note"]');
        return pasteViaMenu('[data-fid="note"]');
      }
      if (/Cortar y pegar/.test(T)) {
        if (ti === 0) { await pressAt(await wordC('.field', /pastilla/)); await wait(150); return click('[data-sa="all"]'); }
        if (ti === 1) return click('[data-sa="cut"]');
        return pasteViaMenu('[data-fid="note"]');
      }
      if (/Copiar una foto/.test(T)) { await press('.ph'); await wait(200); return menuItem(/^Copiar/); }
      if (/Pegar la foto/.test(T)) { if (ti === 0) return click(A ? '[data-app="whatsapp"]' : '[data-app="mensajes"]'); if (ti === 1) return pasteViaMenu('[data-fid="msg"]'); return click('.sendb'); }
      if (/copia un teléfono/.test(T)) {
        if (ti === 0) return selectRange('.web', /^600$/, /^222\.?$/);
        if (ti === 1) return click('[data-sa="copy"]');
        if (ti === 2) return goHome(); if (ti === 3) return click('[data-app="notas"]');
        return pasteViaMenu('[data-fid="note"]');
      }
      if (/ir el teclado|Se me ha ido/.test(T) && s.ti === 1) return A ? click('.nb-back') : click('.sf-fav-t');
      if (/Inicio y Atr/.test(T)) {
        if (s.ti === 0) return goHome();
        if (s.ti === 2) return click('.nb-back');
        return click('.app.glow');
      }
      if (/Una frase/.test(T) && s.ti === 1) return click('.sendb');
      if (/Reto: escribe tu mensaje/.test(T)) { await kbType('msg', 'Hola Marta, ya sé escribir'); return click('.sendb'); }
      if (/no se ve/.test(T)) {
        const a = await center('.p-app');
        await page.mouse.move(a.x, a.y); await page.mouse.wheel(0, 700); await wait(150);
      }
      if (s.hint) return click(s.hint);
      throw new Error('no sé resolver: ' + T);
    };

    const playModule = async mi => {
      await page.goto(URL + '#/m/' + mi + '/0'); await page.evaluate(() => { AM.slow = 0.05; });
      await wait(200);
      let steps = 0;
      for (let g = 0; g < 400; g++) {
        const ct = await celeText();
        if (ct) {
          if (/Módulo terminado/.test(ct)) { if (shotDir) await page.screenshot({ path: `${shotDir}/${v.name}-m${mi}-fin.png` }); await page.click('#cele button:last-child'); return steps; }
          await page.click('#cele button'); await wait(120); continue;
        }
        const s = await state();
        if (!s) { await wait(50); continue; }
        if (s.done) { await wait(100); continue; }
        if (shotDir && s.ti === 0 && !s.type) await page.screenshot({ path: `${shotDir}/${v.name}-m${mi}-s${s.si}.png` });
        const before = s.si + ':' + s.ti;
        try { await solve(s); } catch (e) { if (shotDir) await page.screenshot({ path: `${shotDir}/FALLO-${v.name}-m${mi}-s${s.si}.png` }); throw new Error(`[${v.name}] módulo ${mi} · "${s.step}" tarea ${s.ti}: ${e.message}`); }
        let moved = false;
        for (let w = 0; w < 60; w++) {
          await wait(100);
          const n = await state(); if ((await celeText()) || (n && n.si + ':' + n.ti !== before)) { moved = true; break; }
        }
        if (!moved) { if (shotDir) await page.screenshot({ path: `${shotDir}/ATASCO-${v.name}-m${mi}-s${s.si}.png` }); throw new Error(`[${v.name}] atascado en módulo ${mi} · "${s.step}" tarea ${s.ti}`); }
        steps++;
      }
      throw new Error('demasiados pasos');
    };

    for (const mi of [1, 2, 3, 4, 5]) {
      try { const n = await playModule(mi); console.log(`✔ ${v.name} · módulo ${mi}: ${n} tareas`); }
      catch (e) { console.log('✘ ' + e.message); errors.push(e.message); }
    }
    await page.close();
  }
  await browser.close();
  console.log(errors.length ? '\nERRORES:\n' + errors.join('\n') : '\nTodo correcto');
  process.exit(errors.length ? 1 : 0);
})();
