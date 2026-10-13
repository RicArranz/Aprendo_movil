/* Comprueba que no hay scroll horizontal ni cosas cortadas con distintos tamaños de pantalla y de letra. Uso: node test/responsive.js [carpeta_capturas] */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const shots = process.argv[2];
const sizes = [[320, 568], [360, 640], [390, 844], [768, 1024], [1024, 768], [1366, 768], [1920, 1080]];
(async () => {
  const b = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const bad = [];
  for (const [w, h] of sizes) for (const fs of [16, 20, 26, 32]) for (const os of ['android', 'ios']) {
    const page = await b.newPage({ viewport: { width: w, height: h } });
    await page.addInitScript(([o, f]) => localStorage.setItem('aprendoMovil.v1', JSON.stringify({ os: o, iosHome: 'notch', done: {}, pos: {}, fs: f })), [os, fs]);
    for (const hash of ['#/', '#/menu', '#/m/2/1', '#/m/4/6', '#/elegir']) {
      await page.goto(URL + hash); await page.waitForTimeout(250);
      if (hash === '#/m/2/1') { await page.waitForTimeout(1500); }
      const r = await page.evaluate(() => {
        const de = document.documentElement, o = { sw: de.scrollWidth, cw: de.clientWidth };
        const ph = document.querySelector('#stagebox'), co = document.querySelector('.coach');
        if (ph) { const q = ph.getBoundingClientRect(); o.phone = { w: Math.round(q.width), h: Math.round(q.height), top: Math.round(q.top), right: Math.round(q.right) }; }
        if (co) { const q = co.getBoundingClientRect(); o.coach = { h: Math.round(q.height), right: Math.round(q.right) }; }
        const t = document.querySelector('.top'); o.top = t.getBoundingClientRect().height;
        return o;
      });
      const tag = `${w}x${h} fs${fs} ${os} ${hash}`;
      if (r.sw > r.cw + 1) bad.push(tag + ' scroll horizontal ' + r.sw + '>' + r.cw);
      if (r.phone && r.phone.right > w + 1) bad.push(tag + ' móvil se sale');
      if (r.phone && r.phone.w < 200) bad.push(tag + ' móvil minúsculo ' + r.phone.w + 'px');
      if (r.coach && w > 820 && r.coach.right > w) bad.push(tag + ' coach se sale');
      if (r.coach && r.coach.h > h * 0.6 && w <= 820) bad.push(tag + ' coach ocupa ' + r.coach.h + 'px de ' + h);
      if (r.top > h * 0.25) bad.push(tag + ' cabecera alta ' + Math.round(r.top));
      if (shots && hash === '#/m/2/1' && [[320, 568], [390, 844], [1366, 768]].some(s => s[0] === w && s[1] === h) && [16, 32].includes(fs) && os === 'android') await page.screenshot({ path: `${shots}/r-${w}-fs${fs}.png` });
    }
    await page.close();
  }
  await b.close();
  console.log(bad.length ? bad.join('\n') : 'Todo bien');
})();
