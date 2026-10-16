/* Apps abiertas, pantalla de inicio (mover, carpetas, desinstalar), pantalla de recientes, botones y gestos de navegación. */
(function () {
  'use strict';
  var AM = window.AM, P = AM.Phone.prototype, svg = AM.svg, svgS = AM.svgS, IC = AM.IC, IS = AM.IS, esc = AM.esc, APPS = AM.APPS, SCENES = AM.SCENES;
  var NCELL = 20;

  function defaultLayout(os) {
    var slots = [], i;
    for (i = 0; i < NCELL; i++) slots.push(null);
    ['fotos', 'ajustes', 'notas', 'correo', 'reloj', 'mapas', os === 'ios' ? 'whatsapp' : 'youtube', 'calc', 'solitario', 'radio', 'tiempo'].forEach(function (a, k) { slots[k] = { app: a }; });
    return { slots: slots, dock: ['telefono', os === 'ios' ? 'mensajes' : 'whatsapp', os === 'ios' ? 'safari' : 'chrome', 'camara'] };
  }

  /* ---------- estado de apps ---------- */
  P.initApps = function () {
    this.layout = defaultLayout(this.os); this.running = []; this.cur = null; this.snap = {}; this.sceneParent = null;
    this.editMode = false; this.fold = null; this._renaming = false; this.attach = null; this.sel = null; this._menu = null; this._dlg = null; this.glow = null;
    var self = this;
    this.on(function (ev) {
      if (ev.type === 'input' && ev.id === 'q' && self.scene === 'settings') self.filterSettings(ev.value);
    });
    this.on(function (ev) {   /* poner nombre a una carpeta: se guarda al cerrar el teclado */
      if (self._renaming && ((ev.type === 'kbd' && !ev.open) || (ev.type === 'submit' && ev.id === 'fname'))) self.commitRename();
    });
  };
  P.resetApps = function () {
    var nav = this.navMode;
    this.layout = defaultLayout(this.os); this.running = []; this.cur = null; this.snap = {}; this.sceneParent = null;
    this.editMode = false; this.fold = null; this._renaming = false; this.attach = null; this.sel = null; this.glow = null;
    this.closeLayer();
    if (nav !== 'buttons') this.setNav('buttons');
    this.fg = 'home'; this.scene = 'home'; this.q('.p-app').innerHTML = ''; this.vals = {}; this.fcfg = {};
    this.renderHome(); this.showFg();
  };
  /* Ajustes: al escribir en el buscador, la lista se reduce a lo que se parece */
  P.filterSettings = function (v) {
    var n = function (x) { return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }, q = n(v).trim(), any = false;
    this.root.querySelectorAll('.sett .list .row[data-k]').forEach(function (r) {
      var ok = !q || n(r.dataset.k + ' ' + r.textContent).indexOf(q) >= 0; r.hidden = !ok; if (ok) any = true;
    });
    var none = this.root.querySelector('.sett .row.none'); if (none) none.hidden = any || !q;
    this.emit('searchFilter', { q: q, found: any });
  };
  P.glowId = function () { return this.freeApps ? this.glow : this.cur; };
  P.touchRunning = function (id) { this.running = [id].concat(this.running.filter(function (x) { return x !== id; })); };

  /* ---------- escenas ---------- */
  P.renderScene = function (name, cfg) {
    var app = this.q('.p-app');
    this.scene = name; this.sceneCfg = cfg || {}; this.vals = {}; this.fcfg = {}; this.attach = null; this.sel = null;
    app.innerHTML = SCENES[name](this, this.sceneCfg); app.scrollTop = 0;
    this.tokenizeStatic(); this.refreshFields(); if (name === 'chat') this.updateSend();
    var id = AM.SCENE_APP[this.os][name] || this.sceneCfg.app || null;
    this.cur = id; if (id) this.touchRunning(id);
    this.fg = 'app';
  };
  P.setScene = function (name, cfg) {   /* lo usan los ejercicios para dejar el móvil en un punto de partida */
    cfg = cfg || {};
    this.closeKb(); this.closePanel(true); this.closeLayer(); this.hideRecentsQuiet();
    this.snap = {}; this.running = []; this.cur = null; this.sceneParent = null; this.fold = null; this._renaming = false;
    if (name === 'home') { this.scene = 'home'; this.fg = 'home'; this.q('.p-app').innerHTML = ''; this.vals = {}; this.fcfg = {}; }
    else this.renderScene(name, cfg);
    this.renderHome(); this.showFg();
  };
  P.openIn = function (name, cfg) {      /* ir a una pantalla de dentro de la app (con "atrás") */
    this.sceneParent = { scene: this.scene, cfg: this.sceneCfg };
    this.renderScene(name, cfg);
  };
  P.saveSnap = function () {
    if (!this.cur || this.fg !== 'app') return;
    var app = this.q('.p-app');
    this.snap[this.cur] = { html: app.innerHTML.replace(/ ?hint-ring/g, ''), vals: this.vals, fcfg: this.fcfg, scene: this.scene, cfg: this.sceneCfg, parent: this.sceneParent, attach: this.attach, scroll: app.scrollTop };
  };
  P.restoreSnap = function (id) {
    var s = this.snap[id], app = this.q('.p-app');
    app.innerHTML = s.html; this.vals = s.vals; this.fcfg = s.fcfg; this.scene = s.scene; this.sceneCfg = s.cfg; this.sceneParent = s.parent; this.attach = s.attach; this.sel = null;
    this.refreshFields(); if (this.scene === 'chat') this.updateSend(); if (this.attach) this.showAttach();
    app.scrollTop = s.scroll || 0;
  };
  P.openApp = function (id, via) {
    var prev = this.cur;
    this.hideKb(); this.closePanel(true); this.closeLayer(); this.closeFolder(true); this.hideRecentsQuiet();
    if (this.fg === 'app') this.saveSnap();
    if (this.snap[id]) this.restoreSnap(id);
    else { var sc = AM.APP_SCENE[this.os][id]; this.renderScene(sc || 'dummy', sc ? {} : { app: id }); }
    this.cur = id; this.touchRunning(id); this.fg = 'app'; this.showFg();
    this.emit('appOpen', { app: id, prev: prev, via: via || 'home' });
    if (prev === id) this.emit('resume');
  };
  P.resume = function () { if (this.cur) this.openApp(this.cur, 'home'); };
  /* deja apps ya abiertas "por detrás" (para practicar la pantalla de recientes) */
  P.preload = function (ids) {
    var self = this, keep = this.cur, fg = this.fg, app = this.q('.p-app');
    if (keep && fg === 'app') this.saveSnap();
    ids.slice().reverse().forEach(function (id) {
      if (id === keep || self.snap[id]) { self.touchRunning(id); return; }
      var sc = AM.APP_SCENE[self.os][id];
      self.renderScene(sc || 'dummy', sc ? {} : { app: id }); self.fg = 'app'; self.saveSnap(); self.touchRunning(id);
    });
    if (keep) { this.restoreSnap(keep); this.cur = keep; this.touchRunning(keep); }
    else { this.cur = null; app.innerHTML = ''; this.vals = {}; this.fcfg = {}; }
    this.fg = fg; this.showFg();
  };
  P.showFg = function () {
    this.q('.p-app').classList.toggle('hidden', this.fg !== 'app');
    this.q('.p-home').classList.toggle('hidden', this.fg !== 'home');
    this.q('.p-recents').classList.toggle('open', this.fg === 'recents');
  };
  P.goHome = function () {
    this.closePanel(true); this.hideKb(); this.closeLayer(); this.closeFolder(true);
    if (this.fg === 'app') this.saveSnap();
    this.hideRecentsQuiet(); this.fg = 'home'; this.renderHome(); this.showFg(); this.emit('home');
    if (!this.freeApps && this.cur) this.toast('Estás en el inicio. Tu ejercicio sigue guardado: toca el icono que brilla.');
  };
  P.pressHome = function () {
    var now = Date.now();
    if (this.btn && now - (this._lastHome || 0) < 800) { this._lastHome = 0; this.showRecents(); return; }
    this._lastHome = now; this.goHome();
  };

  /* ---------- atrás ---------- */
  P.navBack = function () {
    if (this.panel) { if (this.panel.edit) { var k = this.panel.kind; this.panel.edit = false; this.panel.gallery = false; this.renderPanel(); this.emit(k === 'cc' ? 'ccEditClose' : 'qsEditClose'); return 'edit'; } this.closePanel(); return 'panel'; }
    if (this._dlg) { this.closeLayer(); return 'dialog'; }
    if (this._menu) { this.closeLayer(); return 'menu'; }
    if (this.fid) { this.hideKb(); return 'kbd'; }
    if (this.sel) { this.clearSel(); return 'sel'; }
    if (this.fold !== null) { this.closeFolder(); return 'folder'; }
    if (this.editMode) { this.editMode = false; this.renderHome(); return 'edit'; }
    if (this.fg === 'recents') { this.hideRecents(); return 'recents'; }
    if (this.fg === 'app') {
      if (this.sceneParent) { var pr = this.sceneParent; this.sceneParent = null; this.renderScene(pr.scene, pr.cfg); return 'up'; }
      if (this.ios) { this.toast('Aquí no hay a dónde volver: ya estás en la primera pantalla de la app.'); return 'none'; }
      this.goHome(); this.emit('backExit'); return 'exit';
    }
    this.toast('Ya estás en el inicio.'); return 'none';
  };
  P.back = function () { var r = this.navBack(); this.emit('back', { result: r }); return r; };

  /* ---------- botones y gestos ---------- */
  P.buildNav = function () {
    var g = this.os === 'android' && this.navMode === 'gestures', ios = this.ios;
    this.root.classList.toggle('gest', g);
    this.q('.p-nav').innerHTML = (ios || g) ? '<div class="gbar" data-zone="' + (ios ? 'botHome' : 'barG') + '" role="button" aria-label="Barra de gestos"><div class="home-ind"></div></div>' :
      '<div class="nb nb-back" data-nav="back" role="button" aria-label="Atrás">' + svg(IC.back, 22) + '</div>' +
      '<div class="nb nb-home" data-nav="home" role="button" aria-label="Inicio">' + svgS(IS.home, 26, 2.5) + '</div>' +
      '<div class="nb nb-rec" data-nav="recents" role="button" aria-label="Aplicaciones abiertas">' + svgS(IS.recents, 22, 2.5) + '</div>';
    var e = '';
    /* arriba hay zonas reales (solo cubren la barra de estado); abajo y a los lados se detecta por coordenadas, para no tapar teclas ni botones */
    if (this.os === 'android') e = '<div class="edge e-top" data-zone="top"></div>';
    else if (this.btn) e = '<div class="edge e-top" data-zone="topN"></div>';
    else e = '<div class="edge e-topL" data-zone="topN"></div><div class="edge e-topR" data-zone="topCC"></div>';
    this.q('.p-edges').innerHTML = e;
  };
  /* ¿el dedo ha empezado en el borde de abajo o en un lado? (no se pone ninguna capa encima, así las teclas siguen funcionando) */
  P.edgeZone = function (e) {
    if (this.fg === 'recents' && !this.btn) return null;
    var b = this.q('.p-body').getBoundingClientRect(), sc = this.scale || 1;
    var x = (e.clientX - b.left) / sc, y = (e.clientY - b.top) / sc, W = b.width / sc, H = b.height / sc;
    var gest = this.os === 'android' && this.navMode === 'gestures';
    if (this.os === 'android' && !gest) return null;
    if (y > H - 48 && y < H) return this.os === 'android' ? 'barG' : (this.btn ? 'botCC' : 'botHome');
    if (y > 90 && y < H - 90) {
      if (x < 26) return 'edgeL';
      if (gest && x > W - 26) return 'edgeR';
    }
    return null;
  };
  P.setNav = function (mode) { this.navMode = mode; this.buildNav(); };

  P.bindNav = function () {
    var self = this;
    this.root.addEventListener('click', function (e) {
      var n = e.target.closest('[data-nav]'); if (!n) return;
      var k = n.dataset.nav;
      if (k === 'back') self.back(); else if (k === 'home') self.pressHome(); else self.showRecents();
    });
    this.root.addEventListener('pointerdown', function (e) {
      var ed = e.target.closest('.edge, .gbar'), pn = e.target.closest('.p-panel');
      var base = { x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, lt: Date.now(), dx: 0, dy: 0 };
      if (ed) { e.preventDefault(); self.drag = Object.assign({ zone: ed.dataset.zone }, base); }
      else if (!pn && self.edgeZone(e)) self.drag = Object.assign({ zone: self.edgeZone(e) }, base);
      else if (pn && !e.target.closest('[data-slider]') && !e.target.closest('.qs-edit') && !(self.panel && self.panel.edit)) self.drag = Object.assign({ zone: 'panel' }, base);
    });
    this._mv = function (e) {
      var d = self.drag; if (!d) return;
      var sc = self.scale || 1; d.dx = (e.clientX - d.x0) / sc; d.dy = (e.clientY - d.y0) / sc;
      if (Math.abs(e.clientX - d.lx) + Math.abs(e.clientY - d.ly) > 7) { d.lt = Date.now(); d.lx = e.clientX; d.ly = e.clientY; }
      var z = d.zone, dx = d.dx, dy = d.dy, vert = Math.abs(dy) > Math.abs(dx) * 1.2;
      if (Math.hypot(dx, dy) > 14) d.moved = true;
      /* con un panel abierto: arrastrar hacia arriba lo cierra desde cualquier sitio (en iPhone, también hacia abajo) */
      if (self.panel && !self.panel.edit && z !== 'edgeL' && z !== 'edgeR' && vert && Math.abs(dy) > 30) {
        if (dy < 0 || self.ios) { self.drag = null; self.closePanel(); return; }
        if (self.panel.kind === 'qs' && self.panel.stage === 1) { self.drag = null; self.openPanel('qs', 2); return; }
      }
      if (self.panel) return;
      if (z === 'top' && dy > 40) { self.drag = null; self.swipeTop('qs'); }
      else if (z === 'topCC' && dy > 40) { self.drag = null; self.swipeTop('cc'); }
      else if (z === 'topN' && dy > 40) { self.drag = null; self.swipeTop('notif'); }
      else if (z === 'botCC' && dy < -40) { self.drag = null; self.swipeTop('cc'); }
      else if (z === 'homeAny' && vert && Math.abs(dy) > 45) {
        /* en la pantalla de inicio se puede arrastrar desde cualquier sitio */
        var b = self.q('.p-body').getBoundingClientRect(), right = (d.x0 - b.left) > b.width * 0.5;
        self.drag = null;
        if (!self.ios) { if (dy > 0) self.swipeTop('qs'); }
        else if (self.btn) self.swipeTop(dy < 0 ? 'cc' : 'notif');
        else if (dy > 0) self.swipeTop(right ? 'cc' : 'notif');
      }
    };
    this._up = function () {
      var d = self.drag; self.drag = null; if (!d) return;
      var z = d.zone, dx = d.dx, dy = d.dy;
      if (z === 'botCC') return;
      if (z === 'botHome' || z === 'barG') {
        if (dy < -45 && Math.abs(dx) < 140) { var held = Date.now() - d.lt > 380 && dy > -300; self.emit('gesture', { kind: held ? 'recents' : 'home' }); if (held) self.showRecents(); else self.goHome(); }
        else if (Math.abs(dx) > 60 && Math.abs(dy) < 50) { self.emit('gesture', { kind: 'switch' }); self.switchPrev(); }
        else self.toast('Pon el dedo en la rayita y desliza hacia arriba.');
      } else if (z === 'edgeL' || z === 'edgeR') {
        if ((z === 'edgeL' && dx > 45) || (z === 'edgeR' && dx < -45)) { self.emit('gesture', { kind: 'back' }); self.back(); }
        else if (d.moved) self.toast('Pon el dedo en el borde de la pantalla y arrástralo hacia dentro.');
      } else if (z === 'top') self.toast('No basta con tocar: pon el dedo arriba del todo y arrástralo hacia abajo.');
      else if (z === 'topCC') self.toast('No basta con tocar: arrastra el dedo desde el borde hacia dentro de la pantalla.');
      if (z === 'top' || z === 'topCC' || z === 'topN') self.emit('edgeTap', { zone: z });
    };
    window.addEventListener('pointermove', this._mv); window.addEventListener('pointerup', this._up); window.addEventListener('pointercancel', this._up);
    this.bindRecents();
  };
  P.unbindNav = function () {
    window.removeEventListener('pointermove', this._mv); window.removeEventListener('pointerup', this._up); window.removeEventListener('pointercancel', this._up);
    window.removeEventListener('pointermove', this._hm); window.removeEventListener('pointerup', this._hu); window.removeEventListener('pointercancel', this._hu);
    window.removeEventListener('pointermove', this._rm); window.removeEventListener('pointerup', this._ru);
  };
  P.switchPrev = function () {
    var id = this.running[1];
    if (!id) { this.toast('No hay otra app abierta a la que cambiar.'); return; }
    this.openApp(id, 'bar');
  };

  /* ---------- aplicaciones recientes ---------- */
  P.showRecents = function () {
    if (this.fg === 'recents') { this.hideRecents(); return; }
    this.closePanel(true); this.hideKb(); this.closeLayer(); this.closeFolder(true);
    if (this.fg === 'app') this.saveSnap();
    this._prevFg = this.fg; this.fg = 'recents'; this.renderRecents(); this.showFg(); this.emit('recents');
  };
  P.hideRecentsQuiet = function () { if (this.fg === 'recents') { this.fg = this._prevFg || 'home'; if (this.fg === 'app' && !this.cur) this.fg = 'home'; this.showFg(); } };
  P.hideRecents = function () { this.hideRecentsQuiet(); this.emit('recentsClose'); };
  P.renderRecents = function () {
    var self = this, ids = this.running.filter(function (id) { return self.snap[id]; });
    var h = '';
    if (!ids.length) h = '<div class="rc-empty">' + (this.ios ? '' : 'No hay aplicaciones recientes') + '</div>';
    else h = '<div class="rc-track">' + ids.map(function (id) {
      var a = APPS[id];
      return '<div class="rc" data-id="' + id + '"><div class="rc-h"><span class="ai" style="background:' + AM.appBg(a, self.ios) + '">' + AM.appIc(a, self.ios) + '</span>' + a[0] + '</div><div class="rc-t"><div class="rc-in">' + self.snap[id].html + '</div></div></div>';
    }).join('') + '</div>' + '<div class="rc-hint">' + (this.ios ? 'Desliza una tarjeta hacia arriba para cerrar la app' : 'Toca una tarjeta para abrirla · Desliza hacia arriba para cerrarla') + '</div>' +
      (this.ios ? '' : '<div class="rc-clear" data-rc="clear">Borrar todo</div>');
    this.q('.p-recents').innerHTML = h;
  };
  P.closeApp = function (id) {
    this.running = this.running.filter(function (x) { return x !== id; }); delete this.snap[id];
    if (this.cur === id) { this.cur = null; }
    this.emit('closeApp', { app: id, left: this.running.length });
    if (!this.running.length) this.emit('closeAll');
  };
  P.bindRecents = function () {
    var self = this, rec = this.q('.p-recents');
    rec.addEventListener('pointerdown', function (e) {
      var c = e.target.closest('.rc'); if (!c) return;
      self._rc = { c: c, id: c.dataset.id, x0: e.clientX, y0: e.clientY, axis: null, dx: 0, dy: 0, sl: c.parentNode.scrollLeft };
    });
    this._rm = function (e) {
      var d = self._rc; if (!d) return;
      var sc = self.scale || 1; d.dx = (e.clientX - d.x0) / sc; d.dy = (e.clientY - d.y0) / sc;
      if (!d.axis && (Math.abs(d.dx) > 8 || Math.abs(d.dy) > 8)) d.axis = Math.abs(d.dy) > Math.abs(d.dx) ? 'v' : 'h';
      if (d.axis === 'v') { d.c.style.transform = 'translateY(' + Math.min(0, d.dy) + 'px)'; d.c.style.opacity = Math.max(.25, 1 + Math.min(0, d.dy) / 300); }
      else if (d.axis === 'h') d.c.parentNode.scrollLeft = d.sl - d.dx;
    };
    this._ru = function () {
      var d = self._rc; self._rc = null; if (!d) return;
      if (d.axis === 'v' && d.dy < -70) {
        d.c.style.transition = 'transform .2s, opacity .2s'; d.c.style.transform = 'translateY(-380px)'; d.c.style.opacity = 0;
        setTimeout(function () { if (self.dead) return; self.closeApp(d.id); if (self.fg === 'recents') self.renderRecents(); }, 200);
      } else if (d.axis === 'v') { d.c.style.transform = ''; d.c.style.opacity = ''; }
      else if (!d.axis) { self._noClick = Date.now(); self.openApp(d.id, 'recents'); }
    };
    window.addEventListener('pointermove', this._rm); window.addEventListener('pointerup', this._ru);
    rec.addEventListener('click', function (e) {
      if (e.target.closest('[data-rc="clear"]')) {
        var ids = self.running.slice(); ids.forEach(function (id) { self.running = self.running.filter(function (x) { return x !== id; }); delete self.snap[id]; });
        self.cur = null; self.renderRecents(); self.emit('closeAll'); return;
      }
      if (!e.target.closest('.rc')) { self.hideRecents(); }
    });
  };

  /* ---------- capa de menús y avisos ---------- */
  P.layer = function () { return this.q('.p-layer'); };
  P.toLocal = function (e) {
    var r = this.q('.p-screen').getBoundingClientRect(), sc = this.scale || 1;
    return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
  };
  P.rectLocal = function (el) {
    var r = el.getBoundingClientRect(), s = this.q('.p-screen').getBoundingClientRect(), sc = this.scale || 1;
    return { l: (r.left - s.left) / sc, t: (r.top - s.top) / sc, w: r.width / sc, h: r.height / sc };
  };
  P.closeMenu = function () {
    var m = this.layer().querySelector('.p-menu'); if (m) m.remove(); this._menu = null;
    this.root.querySelectorAll('.lifted').forEach(function (x) { x.classList.remove('lifted'); });
  };
  P.closeLayer = function () { if (this.sel) this.clearSel(); this.layer().innerHTML = ''; this._menu = null; this._dlg = null; this.sel = null; this.root.querySelectorAll('.lifted').forEach(function (x) { x.classList.remove('lifted'); }); };
  /* items: [{t, fn, cls}]; se coloca junto al elemento "el" */
  P.menuAt = function (items, el, cls) {
    var self = this, L = this.layer(); this.closeMenu();
    var m = document.createElement('div'); m.className = 'p-menu ' + (cls || '');
    m.innerHTML = items.map(function (it, i) { return '<div class="mi ' + (it.cls || '') + '" data-mi="' + i + '">' + it.t + '</div>'; }).join('');
    L.appendChild(m); this._menu = m;
    var r = this.rectLocal(el), W = 342, H = this.q('.p-screen').clientHeight;
    var x = Math.max(8, Math.min(r.l + r.w / 2 - m.offsetWidth / 2, W - m.offsetWidth - 8));
    var y = r.t + r.h + 6; if (y + m.offsetHeight > H - 8) y = Math.max(8, r.t - m.offsetHeight - 6);
    m.style.left = x + 'px'; m.style.top = y + 'px';
    m.addEventListener('click', function (e) {
      var i = e.target.closest('[data-mi]'); if (!i) return;
      var it = items[+i.dataset.mi]; self.closeMenu(); if (it.fn) it.fn();
    });
    return m;
  };
  P.dialog = function (o) {
    var self = this, L = this.layer(); this.closeMenu();
    var d = document.createElement('div'); d.className = 'p-dlg' + (o.sheet ? ' sheet' : '');
    d.innerHTML = '<div class="dlg-box"><div class="dlg-t">' + o.title + '</div>' + (o.msg ? '<div class="dlg-m">' + o.msg + '</div>' : '') +
      '<div class="dlg-b">' + o.btns.map(function (b, i) { return '<div class="db ' + (b.cls || '') + '" data-db="' + i + '" role="button">' + b.t + '</div>'; }).join('') + '</div></div>';
    L.appendChild(d); this._dlg = d;
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-db]');
      if (!b) { if (e.target === d && o.sheet) self.closeLayer(); return; }
      var btn = o.btns[+b.dataset.db]; self.closeLayer(); if (btn.fn) btn.fn();
    });
  };
  /* círculo que se rellena mientras mantienes pulsado */
  P.lpRing = function (e) {
    this.lpEnd(); var p = this.toLocal(e), r = document.createElement('div'); r.className = 'lp-ring'; r.style.left = p.x + 'px'; r.style.top = p.y + 'px';
    this.layer().appendChild(r); this._ring = r;
  };
  P.lpEnd = function () { if (this._ring) { this._ring.remove(); this._ring = null; } };

  /* ---------- pantalla de inicio ---------- */
  function appIcon(p, id) {
    var a = APPS[id], g = p.glowId() === id;
    return '<div class="app' + (g ? ' glow' : '') + '" data-app="' + id + '"><div class="ai" style="background:' + AM.appBg(a, p.ios) + '">' + AM.appIc(a, p.ios) + '</div>' + a[0] + (p.ios && p.editMode ? '<i class="bdg" data-bdg="' + id + '">−</i>' : '') + '</div>';
  }
  function folderIcon(p, f, i) {
    var mini = f.apps.slice(0, 4).map(function (id) { return '<s style="background:' + AM.appBg(APPS[id], p.ios) + '">' + AM.appIc(APPS[id], p.ios) + '</s>'; }).join('');
    return '<div class="app fold" data-folder="' + i + '"><div class="ai fi">' + mini + '</div>' + (f.name ? esc(f.name) : '<span class="dim">Carpeta</span>') + '</div>';
  }
  P.renderHome = function () {
    var self = this, home = this.q('.p-home'), L = this.layout, d = new Date(), t = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    home.classList.toggle('edit', this.ios && this.editMode);
    home.innerHTML = '<div class="hm-clock">' + t + '</div>' + (this.ios && this.editMode ? '<div class="hm-ok" data-hm="ok">OK</div>' : '') +
      '<div class="hm-grid">' + L.slots.map(function (it, i) { return '<div class="cell" data-slot="' + i + '">' + (it ? (it.folder ? folderIcon(self, it, i) : appIcon(self, it.app)) : '') + '</div>'; }).join('') + '</div>' +
      '<div class="hm-dock">' + L.dock.map(function (id) { return '<div class="cell dk">' + appIcon({ glowId: function () { return self.glowId(); }, ios: false }, id) + '</div>'; }).join('') + '</div>' +
      (this.ios ? '' : '<div class="hm-zones"><div class="hz" data-zone="info">' + svgS(IS.info, 22) + '<span>Info. de la app</span></div><div class="hz" data-zone="uninst">' + svgS(IS.trash, 22) + '<span>Desinstalar</span></div></div>');
    if (this.fold !== null) this.renderFolder();
  };

  /* carpeta abierta */
  P.openFolder = function (i) {
    this.fold = i; this._renaming = false; this.renderFolder(); this.emit('folderOpen', { slot: i });
  };
  P.closeFolder = function (quiet) {
    if (this.fold === null) return;
    if (this.fid === 'fname') { this.hideKb(); }
    this.fold = null; this._renaming = false; var f = this.q('.p-fold'); if (f) f.remove();
    this.renderHome(); if (!quiet) this.emit('folderClose');
  };
  P.renderFolder = function () {
    var self = this, f = this.layout.slots[this.fold], old = this.q('.p-fold'); if (old) old.remove();
    if (!f) { this.fold = null; return; }
    var title;
    if (this._renaming) { this.vals.fname = this.vals.fname == null ? f.name : this.vals.fname; title = this.field('fname', { type: 'text', enter: 'done', ph: 'Nombre de la carpeta', home: true, cls: 'fd-in' }); }
    else title = '<div class="fd-t" data-fd="title">' + (f.name ? esc(f.name) : 'Carpeta sin nombre') + '<span class="ed">' + svgS(IS.pencil, 16) + '</span></div>';
    var el = document.createElement('div'); el.className = 'p-fold';
    el.innerHTML = '<div class="fd-card">' + title + '<div class="fd-g">' + f.apps.map(function (id) { return '<div class="cell">' + appIcon(self, id) + '</div>'; }).join('') + '</div>' +
      (this.ios ? '' : '') + '</div>';
    this.q('.p-home').appendChild(el); this.refreshFields();
  };
  P.startRename = function () {
    var f = this.layout.slots[this.fold]; if (!f) return;
    this._renaming = true; this.vals.fname = f.name || ''; this.renderFolder(); this.focus('fname');
  };
  P.commitRename = function () {
    if (!this._renaming) return;
    var f = this.layout.slots[this.fold]; if (!f) { this._renaming = false; return; }
    f.name = (this.vals.fname || '').trim(); this._renaming = false;
    this.renderHome(); this.emit('rename', { name: f.name });
  };

  /* desinstalar / quitar */
  /* aviso con botón "Deshacer" (por si borran algo sin querer) */
  P.snackbar = function (txt, action, fn) {
    var self = this, L = this.layer(), old = L.querySelector('.p-snack'); if (old) old.remove();
    var s = document.createElement('div'); s.className = 'p-snack'; s.innerHTML = '<span>' + txt + '</span><b role="button">' + action + '</b>';
    L.appendChild(s); var t = setTimeout(function () { s.remove(); }, 9000);
    s.querySelector('b').addEventListener('click', function () { clearTimeout(t); s.remove(); fn(); });
  };
  P.undoRemove = function (rec) {
    var L = this.layout, i = L.slots[rec.slot] ? L.slots.indexOf(null) : rec.slot;
    if (i < 0) return;
    if (rec.inFolder !== undefined && L.slots[rec.inFolder] && L.slots[rec.inFolder].folder) L.slots[rec.inFolder].apps.push(rec.id); else L.slots[i] = { app: rec.id };
    this.renderHome(); this.toast('«' + APPS[rec.id][0] + '» ha vuelto.'); this.emit('undo', { app: rec.id });
  };
  P.uninstall = function (id) {
    var L = this.layout, rec = { id: id, slot: -1 };
    L.slots.forEach(function (it, i) { if (!it) return; if (it.folder) { if (it.apps.indexOf(id) >= 0) rec.inFolder = i; it.apps = it.apps.filter(function (a) { return a !== id; }); if (!it.apps.length) L.slots[i] = null; } else if (it.app === id) { rec.slot = i; L.slots[i] = null; } });
    if (rec.slot < 0) rec.slot = rec.inFolder !== undefined ? rec.inFolder : 0;
    L.dock = L.dock.filter(function (a) { return a !== id; });
    this.running = this.running.filter(function (x) { return x !== id; }); delete this.snap[id]; if (this.cur === id) this.cur = null;
    this.renderHome(); this.emit('uninstall', { app: id });
    var self = this; this.snackbar('«' + APPS[id][0] + '» se ha ' + (this.ios ? 'eliminado' : 'desinstalado') + '.', 'Deshacer', function () { self.undoRemove(rec); });
  };
  P.confirmUninstall = function (id) {
    var self = this, n = APPS[id][0];
    if (!this.ios) {
      this.dialog({ title: '¿Quieres desinstalar esta app?', msg: '<b>' + n + '</b> y sus datos se borrarán del móvil.', btns: [{ t: 'Cancelar' }, { t: 'Aceptar', cls: 'pri', fn: function () { self.uninstall(id); } }] });
    } else {
      this.dialog({
        sheet: true, title: '«' + n + '»', btns: [
          { t: 'Eliminar app', cls: 'red', fn: function () { self.dialog({ title: '¿Eliminar «' + n + '»?', msg: 'Al eliminar esta app también se borrarán sus datos.', btns: [{ t: 'Eliminar', cls: 'red', fn: function () { self.uninstall(id); } }, { t: 'Cancelar' }] }); } },
          { t: 'Quitar del inicio', fn: function () { self.removeHome(id); } }, { t: 'Cancelar' }]
      });
    }
  };
  P.removeHome = function (id) {
    var L = this.layout, rec = { id: id, slot: 0 }; L.slots.forEach(function (it, i) { if (it && !it.folder && it.app === id) { rec.slot = i; L.slots[i] = null; } });
    this.renderHome(); this.emit('removeHome', { app: id });
    var self = this; this.snackbar('«' + APPS[id][0] + '» sigue instalada (Biblioteca de apps).', 'Deshacer', function () { self.undoRemove(rec); });
  };

  /* mantener pulsado, arrastrar, soltar */
  P.bindHome = function () {
    var self = this, home = this.q('.p-home');
    home.addEventListener('pointerdown', function (e) {
      if (self._menu && !e.target.closest('.p-menu')) self.closeMenu();
      var ic = e.target.closest('.hm-grid .app');
      if (!ic && !e.target.closest('.p-menu, .p-fold, .hm-ok, .p-dlg, .app') && self.fold === null && e.button <= 0) {
        self.drag = { zone: 'homeAny', x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, lt: Date.now(), dx: 0, dy: 0 };
      }
      if (!ic || e.button > 0) return;
      var cell = ic.closest('[data-slot]');
      self._hd = { ic: ic, slot: +cell.dataset.slot, app: ic.dataset.app, folder: ic.dataset.folder, x0: e.clientX, y0: e.clientY, lifted: false, dragging: false, cancel: false };
      if (!(self.ios && self.editMode)) { self.lpRing(e); self._hd.t = setTimeout(function () { self.lift(); }, 350); }
    });
    this._hm = function (e) {
      var h = self._hd; if (!h) return;
      var dist = Math.hypot(e.clientX - h.x0, e.clientY - h.y0) / (self.scale || 1);
      if (!h.dragging) {
        if ((h.lifted && dist > 6) || (self.ios && self.editMode && dist > 6)) self.startDrag(e);
        else if (!h.lifted && dist > 12 && !h.cancel) {
          h.cancel = true; clearTimeout(h.t); self.lpEnd();
          /* si se mueve antes de levantar la app, es un gesto: arrastrar desde cualquier sitio */
          if (!(self.ios && self.editMode) && self.fold === null) self.drag = { zone: 'homeAny', x0: h.x0, y0: h.y0, lx: e.clientX, ly: e.clientY, lt: Date.now(), dx: 0, dy: 0 };
        }
      }
      if (h.dragging) self.moveDrag(e);
    };
    this._hu = function (e) {
      var h = self._hd; self._hd = null; if (!h) return;
      clearTimeout(h.t); self.lpEnd();
      if (h.dragging) { self.endDrag(h, e); self._noClick = Date.now(); }
      else if (h.lifted) self._noClick = Date.now();
    };
    window.addEventListener('pointermove', this._hm); window.addEventListener('pointerup', this._hu); window.addEventListener('pointercancel', this._hu);
    home.addEventListener('click', function (e) {
      var t = e.target;
      var fl = t.closest('.field'); if (fl) { self.focus(fl.dataset.fid); return; }
      if (t.closest('.bdg')) { self.confirmUninstall(t.closest('.bdg').dataset.bdg); return; }
      if (t.closest('[data-hm="ok"]')) { self.editMode = false; self.renderHome(); return; }
      if (t.closest('[data-fd="title"]')) { self.startRename(); return; }
      if (t.closest('.fd-card')) { var a0 = t.closest('[data-app]'); if (!a0) return; }
      else if (t.closest('.p-fold')) { self.closeFolder(); return; }
      var fo = t.closest('[data-folder]');
      if (fo) { if (!(self.ios && self.editMode)) self.openFolder(+fo.dataset.folder); return; }
      var a = t.closest('[data-app]'); if (!a || (self.ios && self.editMode)) return;
      var id = a.dataset.app; self.emit('homeTap', { app: id });
      if (self.freeApps || id === self.cur) self.openApp(id, 'home');
      else if (self.cur) self.toast('Ahora practicamos en «' + APPS[self.cur][0] + '». Toca el icono que brilla.');
      else self.toast('Hoy practicamos otra cosa. Mira arriba de la pantalla.');
    });
  };
  P.lift = function () {
    var h = this._hd; if (!h || h.cancel) return;
    h.lifted = true; this.lpEnd(); h.ic.classList.add('lifted');
    var self = this, id = h.app, items;
    if (h.folder !== undefined) {
      items = this.ios ? [{ t: 'Cambiar nombre', fn: function () { self.openFolder(+h.folder); self.startRename(); } }, { t: 'Editar pantalla de inicio', fn: function () { self.editMode = true; self.renderHome(); } }] : null;
    } else if (this.ios) {
      items = [{ t: 'Quitar app', cls: 'red', fn: function () { self.confirmUninstall(id); } }, { t: 'Editar pantalla de inicio', fn: function () { self.editMode = true; self.renderHome(); } }, { t: 'Compartir app', fn: function () { self.toast('Aquí se abriría el menú de compartir.'); } }];
    } else {
      items = [{ t: 'Info. de la app', fn: function () { self.toast('Aquí verías los datos de la app.'); } }, { t: 'Desinstalar', cls: 'red', fn: function () { self.confirmUninstall(id); } }];
    }
    if (items) this.menuAt(items, h.ic, this.ios ? 'ctx' : 'pop');
    this.emit('lift', { app: id });
  };
  P.startDrag = function (e) {
    var h = this._hd, home = this.q('.p-home'), ghost = h.ic.cloneNode(true);
    h.dragging = true; this.closeMenu(); clearTimeout(h.t); this.lpEnd();
    ghost.classList.add('ghost'); ghost.classList.remove('lifted'); home.appendChild(ghost); h.ghost = ghost;
    if (this.ios && !this.editMode) { this.editMode = true; this.renderHome(); home.appendChild(ghost); }
    var src = this.q('.hm-grid [data-slot="' + h.slot + '"] .app'); if (src) src.classList.add('ghosted');
    home.classList.add('dragging');
  };
  /* celda (o zona de arriba) que corresponde al dedo; si cae entre dos, la más cercana */
  P.cellAt = function (e) {
    var t = document.elementFromPoint(e.clientX, e.clientY), c = t && t.closest('.hm-grid .cell, .hz');
    if (c) return c;
    var best = null, bd = 1e9, sc = this.scale || 1;
    this.root.querySelectorAll('.hm-grid .cell').forEach(function (el) {
      var r = el.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < bd) { bd = d; best = el; }
    });
    return bd < 80 * sc ? best : null;
  };
  P.moveDrag = function (e) {
    var h = this._hd, home = this.q('.p-home'), r = home.getBoundingClientRect(), sc = this.scale || 1;
    h.ghost.style.left = ((e.clientX - r.left) / sc - 35) + 'px'; h.ghost.style.top = ((e.clientY - r.top) / sc - 35) + 'px';
    this.root.querySelectorAll('.hover, .merge').forEach(function (x) { x.classList.remove('hover', 'merge'); });
    var c = this.cellAt(e);
    if (c) {
      var slot = c.dataset.slot, S = this.layout.slots;
      c.classList.add(slot !== undefined && +slot !== h.slot && S[+slot] && !S[h.slot].folder ? 'merge' : 'hover');
    }
  };
  P.endDrag = function (h, e) {
    var home = this.q('.p-home'), t = this.cellAt(e);
    h.ghost.remove(); home.classList.remove('dragging');
    this.root.querySelectorAll('.hover, .merge').forEach(function (x) { x.classList.remove('hover', 'merge'); });
    var z = t && t.closest('.hz'), cell = t && t.closest('.hm-grid .cell');
    if (z) {
      this.renderHome();
      if (z.dataset.zone === 'uninst' && h.app) this.confirmUninstall(h.app); else this.toast('Aquí verías los datos de la app.');
      return;
    }
    if (!cell) { this.renderHome(); return; }
    var to = +cell.dataset.slot, from = h.slot, S = this.layout.slots, src = S[from], dst = S[to];
    if (to === from) { this.renderHome(); return; }
    if (!dst) { S[to] = src; S[from] = null; this.renderHome(); this.emit('move', { app: src.folder ? 'folder' : src.app, slot: to, from: from }); return; }
    if (src.folder) { this.toast('Una carpeta no se puede meter dentro de otra.'); this.renderHome(); return; }
    if (dst.folder) { dst.apps.push(src.app); S[from] = null; this.renderHome(); this.emit('folderAdd', { app: src.app, slot: to, count: dst.apps.length }); return; }
    S[to] = { folder: true, name: this.ios ? 'Utilidades' : '', apps: [dst.app, src.app] }; S[from] = null;
    this.renderHome(); this.emit('folder', { apps: S[to].apps.slice(), slot: to });
  };
})();
