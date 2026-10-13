/* Captura la lección en tamaño de móvil (390x844). */
const path = require('path');
let pw; try { pw = require('/root/rp/node_modules/playwright'); } catch (e) { pw = require('playwright'); }
(async () => {
  const b = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.addInitScript(() => localStorage.setItem('aprendoMovil.v1', JSON.stringify({ os: 'android', done: {}, pos: {}, fs: 20 })));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html') + '#/m/1/0'); await page.waitForTimeout(500);
  await page.screenshot({ path: process.argv[2] + '/movil-1.png' });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html') + '#/menu'); await page.waitForTimeout(300);
  await page.screenshot({ path: process.argv[2] + '/movil-menu.png', fullPage: true });
  await b.close();
})();
