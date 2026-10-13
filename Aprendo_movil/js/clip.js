/* Copiar y pegar: mantener pulsado, seleccionar palabras (con tiradores), Copiar / Cortar / Pegar, imágenes. */
(function () {
  'use strict';
  var AM = window.AM, P = AM.Phone.prototype, svg = AM.svg, IC = AM.IC;

  P.tokenizeStatic = function () {
    var self = this;
    this.root.querySelectorAll('.p-app .seltxt').forEach(function (el) { if (!el.dataset.done) { self.tokens(el, el.dataset.text || ''); el.dataset.done = '1'; } });
  };
  function boxText(box) { return box.classList.contains('seltxt') ? (box.dataset.text || '') : (box.dataset.v || ''); }
  function words(box) { return Array.prototype.slice.call(box.querySelectorAll('.w')); }

  P.bindClip = function () {
    var self = this, app = this.q('.p-app');
    app.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      var w = e.target.closest('.w'), pic = e.target.closest('.pic, .ph'), fld = e.target.closest('.field');
      if (!(w || pic || fld)) return;
      self._lp = { x0: e.clientX, y0: e.clientY, w: w, pic: pic, fld: fld, cx: e.clientX, cy: e.clientY, fired: false };
      self.lpRing(e);
      self._lp.t = setTimeout(function () { self.lpFire(); }, 380);
    });
    this._lm = function (e) {
      var l = self._lp; if (!l || l.fired) return;
      if (Math.hypot(e.clientX - l.x0, e.clientY - l.y0) / (self.scale || 1) > 10) { clearTimeout(l.t); self.lpEnd(); self._lp = null; }
    };
    this._lu = function () {
      var l = self._lp; self._lp = null; if (!l) return;
      clearTimeout(l.t); self.lpEnd(); if (l.fired) self._noClick = Date.now();
    };
    window.addEventListener('pointermove', this._lm); window.addEventListener('pointerup', this._lu); window.addEventListener('pointercancel', this._lu);
    app.addEventListener('scroll', function () { if (self.sel) self.clearSel(); });
    this.on(function (ev) { if (ev.type === 'kbd' && self.sel) self.clearSel(); });
    /* tiradores y barra de botones de la selección */
    this.layer().addEventListener('pointerdown', function (e) {
      var h = e.target.closest('.sel-h'); if (!h || !self.sel) return;
      e.preventDefault(); self._hdr = { which: h.dataset.h };
    });
    this._hm2 = function (e) {
      var d = self._hdr; if (!d || !self.sel) return;
      /* palabra más cercana al dedo (aunque caiga entre dos palabras o un poco debajo de la línea) */
      var sc = self.scale || 1, y = e.clientY - 18 * sc, best = -1, bd = 1e9;
      words(self.sel.box).forEach(function (w, k) {
        var r = w.getBoundingClientRect(), dy = Math.abs(y - (r.top + r.height / 2)); if (dy > r.height * 1.1) return;
        var dx = e.clientX < r.left ? r.left - e.clientX : (e.clientX > r.right ? e.clientX - r.right : 0), dd = dx + dy * 3;
        if (dd < bd) { bd = dd; best = k; }
      });
      if (best < 0) return;
      var i = best;
      if (d.which === 'a') self.sel.a = Math.min(i, self.sel.b); else self.sel.b = Math.max(i, self.sel.a);
      self.paintSel();
    };
    this._hu2 = function () { if (self._hdr) { self._hdr = null; if (self.sel) self.emit('select', { text: self.selText() }); } };
    window.addEventListener('pointermove', this._hm2); window.addEventListener('pointerup', this._hu2);
  };
  var unbind = P.unbindNav;
  P.unbindNav = function () {
    unbind.call(this);
    window.removeEventListener('pointermove', this._lm); window.removeEventListener('pointerup', this._lu); window.removeEventListener('pointercancel', this._lu);
    window.removeEventListener('pointermove', this._hm2); window.removeEventListener('pointerup', this._hu2);
  };

  P.lpFire = function () {
    var l = this._lp; if (!l) return;
    l.fired = true; this.lpEnd();
    if (l.w) {
      var box = l.w.parentNode;
      if (!box.closest('.p-app')) return;
      this.selectWord(box, +l.w.dataset.i);
    } else if (l.pic) this.imageMenu(l.pic);
    else if (l.fld) this.fieldMenu(l.fld);
  };

  /* ---------- selección ---------- */
  P.selectWord = function (box, i) {
    this.clearSel();
    var f = box.closest('.field');
    this.sel = { box: box, a: i, b: i, fid: f ? f.dataset.fid : null };
    this.paintSel(); this.emit('select', { text: this.selText() });
  };
  P.selText = function () {
    var s = this.sel; if (!s) return '';
    var ws = words(s.box), t = boxText(s.box);
    return t.slice(+ws[s.a].dataset.s, +ws[s.b].dataset.e);
  };
  P.clearSel = function () {
    var s = this.sel; this.sel = null;
    if (s) words(s.box).forEach(function (w) { w.classList.remove('sel'); });
    var u = this.layer().querySelector('.sel-ui'); if (u) u.remove();
  };
  P.paintSel = function () {
    var s = this.sel; if (!s) return;
    var ws = words(s.box), self = this, L = this.layer(), ios = this.ios;
    ws.forEach(function (w, i) { w.classList.toggle('sel', i >= s.a && i <= s.b); });
    var u = L.querySelector('.sel-ui'); if (u) u.remove();
    var r1 = this.rectLocal(ws[s.a]), r2 = this.rectLocal(ws[s.b]);
    u = document.createElement('div'); u.className = 'sel-ui';
    var isField = !!s.fid, items = [];
    if (isField) items.push(['cut', 'Cortar']);
    items.push(['copy', 'Copiar']);
    if (isField && this.clip) items.push(['paste', 'Pegar']);
    items.push(['all', 'Seleccionar todo']);
    u.innerHTML = '<i class="sel-h" data-h="a" style="left:' + (r1.l - 7) + 'px;top:' + (r1.t + r1.h - 2) + 'px"></i><i class="sel-h" data-h="b" style="left:' + (r2.l + r2.w - 7) + 'px;top:' + (r2.t + r2.h - 2) + 'px"></i>' +
      '<div class="sel-bar' + (ios ? ' ios' : '') + '">' + items.map(function (it) { return '<span data-sa="' + it[0] + '">' + it[1] + '</span>'; }).join('') + '</div>';
    L.appendChild(u);
    var bar = u.querySelector('.sel-bar'), W = 342;
    var x = Math.max(6, Math.min((r1.l + r2.l + r2.w) / 2 - bar.offsetWidth / 2, W - bar.offsetWidth - 6));
    var y = r1.t - bar.offsetHeight - 10; if (y < 4) y = r2.t + r2.h + 26;
    bar.style.left = x + 'px'; bar.style.top = y + 'px';
    bar.addEventListener('click', function (e) { var a = e.target.closest('[data-sa]'); if (a) self.selAction(a.dataset.sa); });
  };
  P.selAction = function (a) {
    var s = this.sel; if (!s) return;
    if (a === 'all') { var n = words(s.box).length; s.a = 0; s.b = n - 1; this.paintSel(); this.emit('selectAll', { text: this.selText() }); this.emit('select', { text: this.selText() }); return; }
    var text = this.selText(), fid = s.fid, ws = words(s.box), full = boxText(s.box);
    if (a === 'copy') { this.clip = { type: 'text', text: text }; this.clearSel(); this.toast(this.ios ? 'Copiado ✔' : '📋 Texto copiado'); this.emit('copy', { text: text }); return; }
    if (a === 'cut') {
      var st = +ws[s.a].dataset.s, en = +ws[s.b].dataset.e;
      this.clip = { type: 'text', text: text }; this.clearSel();
      this.setValue(fid, (full.slice(0, st) + full.slice(en)).replace(/\s+$/, '').replace(/^\s+/, ''));
      this.toast(this.ios ? 'Cortado ✔' : '📋 Texto cortado'); this.emit('cut', { text: text }); return;
    }
    if (a === 'paste') {
      var st2 = +ws[s.a].dataset.s, en2 = +ws[s.b].dataset.e; this.clearSel();
      this.setValue(fid, full.slice(0, st2) + this.clip.text + full.slice(en2));
      this.emit('paste', { id: fid, text: this.clip.text, kind: 'text' }); this.emit('input', { id: fid, value: this.getValue(fid) }); return;
    }
  };

  /* ---------- menú al mantener pulsado un cuadro ---------- */
  P.fieldMenu = function (fld) {
    var self = this, id = fld.dataset.fid, items = [];
    if (this.fg !== 'app') return;
    this.focus(id);
    var v = this.getValue(id);
    if (this.clip) items.push({ t: 'Pegar', fn: function () { self.pasteInto(id); } });
    if (v) items.push({ t: 'Seleccionar todo', fn: function () { var box = fld.querySelector('.f-txt'); var n = words(box).length; self.sel = { box: box, a: 0, b: n - 1, fid: id }; self.paintSel(); self.emit('selectAll', { text: self.selText() }); self.emit('select', { text: self.selText() }); } });
    if (!items.length) { this.toast('No hay nada que pegar todavía. Primero copia algo.'); return; }
    setTimeout(function () { if (!self.dead && self.fid === id) { var f2 = self.root.querySelector('.field[data-fid="' + id + '"]'); if (f2) self.menuAt(items, f2, 'bar' + (self.ios ? ' ios' : '')); } }, 90);
  };
  P.pasteInto = function (id) {
    var c = this.clip;
    if (!c) { this.toast('No hay nada que pegar todavía. Primero copia algo.'); return; }
    if (c.type === 'text') {
      var v = this.getValue(id); this.setValue(id, v + c.text);
      if (this.fid) { this.kb.autoShift(); this.kb.render(); }
      this.emit('paste', { id: id, text: c.text, kind: 'text' }); this.emit('input', { id: id, value: this.getValue(id) });
    } else if (id === 'msg') {
      this.attach = { emoji: c.emoji, color: c.color }; this.showAttach(); this.updateSend();
      this.emit('paste', { id: id, kind: 'image' });
    } else this.toast('En este cuadro solo se puede pegar texto.');
  };
  P.showAttach = function () {
    var a = this.q('.cht-att'), t = this.attach; if (!a || !t) return;
    a.hidden = false; a.innerHTML = '<div class="att-th" style="background:' + t.color + '">' + t.emoji + '</div><span>Imagen lista para enviar</span><i data-tap="attach-x" aria-label="Quitar imagen">×</i>';
  };
  P.clearAttach = function (quiet) {
    this.attach = null; var a = this.q('.cht-att'); if (a) { a.hidden = true; a.innerHTML = ''; } this.updateSend(); if (!quiet) this.emit('attachClear');
  };

  /* ---------- imágenes ---------- */
  P.imageMenu = function (el) {
    var self = this, ios = this.ios, web = el.classList.contains('pic');
    var data = { type: 'image', emoji: el.dataset.emoji, color: el.dataset.color, id: el.dataset.img };
    var other = function (t) { return { t: t, fn: function () { self.toast('Eso no hace falta ahora. Busca «Copiar».'); } }; };
    var copy = function (t) { return { t: t, fn: function () { self.clip = data; self.toast(ios ? 'Copiado ✔' : '📋 Imagen copiada'); self.emit('copyImage', { id: data.id }); } }; };
    var items;
    if (web) items = ios ? [other('Añadir a Fotos'), copy('Copiar'), other('Compartir…')] : [other('Abrir imagen en pestaña nueva'), other('Descargar imagen'), copy('Copiar imagen'), other('Compartir imagen')];
    else items = ios ? [copy('Copiar'), other('Compartir…'), other('Duplicar'), other('Añadir a favoritos')] : [other('Compartir'), copy('Copiar'), other('Información')];
    this.menuAt(items, el, ios ? 'ctx' : 'pop');
    this.emit('imageMenu', { id: data.id });
  };
})();
