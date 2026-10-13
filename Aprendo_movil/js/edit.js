/* Editar el panel de ajustes rápidos (Android) y el centro de control (iPhone, desde Ajustes). */
(function () {
  'use strict';
  var AM = window.AM, P = AM.Phone.prototype, svgS = AM.svgS, IS = AM.IS, TILES = AM.TILES, CC = AM.CC_ITEMS;
  var DEFAULT_QS = ['wifi', 'bt', 'torch', 'rot', 'air', 'dnd', 'saver', 'loc'];

  /* ---------- Android: editor de iconos ---------- */
  P.openQsEdit = function () { if (!this.panel) return; this.panel.edit = true; this.renderPanel(); this.emit('qsEditOpen'); };
  P.renderQsEdit = function () {
    var self = this, el = this.q('.p-panel'), list = this.qsList;
    var avail = Object.keys(TILES).filter(function (id) { return list.indexOf(id) < 0; });
    var tile = function (id, i, a) {
      return '<div class="qt' + (a ? ' av' : '') + (!a && i < 4 ? ' f4' : '') + '" data-qt="' + id + '"' + (a ? ' data-avail="1"' : ' data-i="' + i + '"') + '>' +
        (a ? '' : '<span class="qn">' + (i + 1) + '</span>') + '<span class="ti">' + TILES[id][0] + '</span><b>' + TILES[id][1] + '</b>' +
        (a ? '<i class="add" data-add="' + id + '">+</i>' : '<i class="rm" data-rm="' + id + '" aria-label="Quitar">−</i>') + '</div>';
    };
    el.innerHTML = '<div class="qs qs-edit"><div class="qe-top"><span class="qe-back" data-qs="done" role="button" aria-label="Volver">' + svgS(IS.chevl, 24) + '</span><b>Editar iconos</b><span class="qe-reset" data-qs="reset" role="button">Restablecer</span></div>' +
      '<div class="qe-sc"><p>Los <b>4 primeros</b> (marcados) se ven al primer arrastre. <b>Mantén el dedo</b> sobre un icono y arrástralo para cambiarlo de sitio.</p>' +
      '<div class="qe-grid act">' + list.map(function (id, i) { return tile(id, i, false); }).join('') + '</div>' +
      '<div class="qe-remove" hidden>' + svgS(IS.trash, 20) + ' Suelta aquí para quitar</div>' +
      '<p>Iconos que puedes <b>añadir</b>: tócalos, o arrástralos al sitio que quieras.</p>' +
      '<div class="qe-grid pool">' + (avail.length ? avail.map(function (id) { return tile(id, 0, true); }).join('') : '<em>No queda ninguno por añadir.</em>') + '</div></div></div>';
  };
  P.qsChanged = function (id) { this.renderQsEdit(); this.emit('qsEdit', { list: this.qsList.slice(), id: id }); };

  P.bindEdit = function () {
    var self = this, panel = this.q('.p-panel'), app = this.q('.p-app');
    this.panelClick = function (e) {
      var t = e.target;
      if (t.closest('[data-qs="edit"]')) { self.openQsEdit(); return true; }
      if (t.closest('[data-qs="done"]')) { self.panel.edit = false; self.renderPanel(); self.emit('qsEditClose'); return true; }
      if (t.closest('[data-qs="reset"]')) { self.qsList = DEFAULT_QS.slice(); self.qsChanged(null); return true; }
      var ce = t.closest('[data-ccedit]');
      if (ce) {
        var a = ce.dataset.ccedit;
        if (a === 'open') { self.panel.edit = true; self.renderPanel(); self.emit('ccEditOpen'); }
        else if (a === 'done') { self.panel.edit = false; self.panel.gallery = false; self.renderPanel(); self.emit('ccEditClose'); }
        else if (a === 'gallery') { self.panel.gallery = true; self.renderPanel(); self.emit('ccGallery'); }
        else if (a === 'closeg') { self.panel.gallery = false; self.renderPanel(); }
        return true;
      }
      var pk = t.closest('[data-ccpick]');
      if (pk) { var pid = pk.dataset.ccpick; self.ccList.push(pid); self.panel.gallery = false; self.renderPanel(); self.emit('ccEdit', { list: self.ccList.slice(), id: pid, what: 'add' }); return true; }
      var r2 = t.closest('[data-ccrm2]');
      if (r2) { var rid = r2.dataset.ccrm2; self.ccList = self.ccList.filter(function (x) { return x !== rid; }); self.renderPanel(); self.emit('ccEdit', { list: self.ccList.slice(), id: rid, what: 'remove' }); return true; }
      var rm = t.closest('[data-rm]');
      if (rm) { var id = rm.dataset.rm; self.qsList = self.qsList.filter(function (x) { return x !== id; }); self.qsChanged(id); self.emit('qsRemove', { id: id }); return true; }
      var av = t.closest('.qt[data-avail]');
      if (av) { self.qsList.push(av.dataset.qt); self.toast('Añadido al final. Arrástralo para ponerlo donde quieras.'); self.qsChanged(av.dataset.qt); self.emit('qsAdd', { id: av.dataset.qt }); return true; }
      return false;
    };
    panel.addEventListener('pointerdown', function (e) {
      if (!self.panel || !self.panel.edit || e.button > 0) return;
      var t = e.target.closest('.qt'); if (!t || e.target.closest('.rm')) return;
      self._qd = { t: t, id: t.dataset.qt, avail: !!t.dataset.avail, x0: e.clientX, y0: e.clientY, dragging: false };
    });
    this._qm = function (e) {
      var d = self._qd; if (!d) return;
      var dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0) / (self.scale || 1);
      if (!d.dragging && dist > 8) {
        d.dragging = true; var g = d.t.cloneNode(true); g.classList.add('ghost'); panel.appendChild(g); d.ghost = g; d.t.classList.add('ghosted');
        var rmz = panel.querySelector('.qe-remove'); if (rmz && !d.avail) rmz.hidden = false;
      }
      if (d.dragging) {
        var r = panel.getBoundingClientRect(), sc = self.scale || 1;
        d.ghost.style.left = ((e.clientX - r.left) / sc - 40) + 'px'; d.ghost.style.top = ((e.clientY - r.top) / sc - 36) + 'px';
        panel.querySelectorAll('.hover').forEach(function (x) { x.classList.remove('hover'); });
        var el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest('.qt[data-i], .qe-remove');
        if (c) c.classList.add('hover');
      }
    };
    this._qu = function (e) {
      var d = self._qd; self._qd = null; if (!d || !d.dragging) return;
      self._noClick = Date.now();
      var t = document.elementFromPoint(e.clientX, e.clientY); d.ghost.remove();
      var L = self.qsList, rmz = t && t.closest('.qe-remove'), tile = t && t.closest('.qt[data-i]'), inAct = t && t.closest('.qe-grid.act');
      if (rmz && !d.avail) { self.qsList = L.filter(function (x) { return x !== d.id; }); self.qsChanged(d.id); self.emit('qsRemove', { id: d.id }); return; }
      if (tile) {
        var to = +tile.dataset.i;
        if (d.avail) L.splice(to, 0, d.id); else { var from = L.indexOf(d.id); L.splice(from, 1); L.splice(to, 0, d.id); }
        self.qsChanged(d.id); if (d.avail) self.emit('qsAdd', { id: d.id }); return;
      }
      if (inAct && d.avail) { L.push(d.id); self.qsChanged(d.id); self.emit('qsAdd', { id: d.id }); return; }
      self.renderQsEdit();
    };
    window.addEventListener('pointermove', this._qm); window.addEventListener('pointerup', this._qu);

    /* ---------- iPhone: mover los botones del centro de control ---------- */
    panel.addEventListener('pointerdown', function (e) {
      if (!self.panel || !self.panel.edit || self.panel.kind !== 'cc' || e.button > 0) return;
      var t = e.target.closest('.cc-b[data-ccid]'); if (!t || e.target.closest('.bdg')) return;
      self._cq = { t: t, id: t.dataset.ccid, x0: e.clientX, y0: e.clientY, dragging: false };
    });
    this._pm = function (e) {
      var d = self._cq; if (!d) return;
      if (!d.dragging && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) / (self.scale || 1) > 7) {
        d.dragging = true; var g = d.t.cloneNode(true); g.classList.add('ghost'); g.removeAttribute('data-ccid'); panel.appendChild(g); d.ghost = g; d.t.classList.add('ghosted');
      }
      if (d.dragging) {
        var r = panel.getBoundingClientRect(), sc = self.scale || 1;
        d.ghost.style.left = ((e.clientX - r.left) / sc - 36) + 'px'; d.ghost.style.top = ((e.clientY - r.top) / sc - 36) + 'px';
        panel.querySelectorAll('.hover').forEach(function (x) { x.classList.remove('hover'); });
        var c = self.ccCellAt(e); if (c && c !== d.t) c.classList.add('hover');
      }
    };
    this._pu = function (e) {
      var d = self._cq; self._cq = null; if (!d || !d.dragging) return;
      self._noClick = Date.now(); var c = self.ccCellAt(e); d.ghost.remove();
      if (c && c !== d.t) {
        var L = self.ccList, from = L.indexOf(d.id), to = L.indexOf(c.dataset.ccid);
        L.splice(from, 1); L.splice(to, 0, d.id); self.renderPanel(); self.emit('ccEdit', { list: L.slice(), id: d.id, what: 'move' });
      } else self.renderPanel();
    };
    window.addEventListener('pointermove', this._pm); window.addEventListener('pointerup', this._pu); window.addEventListener('pointercancel', this._pu);

    /* ---------- iPhone antiguo: Ajustes › Centro de control ---------- */
    app.addEventListener('click', function (e) {
      if (self.scene !== 'ccsettings') return;
      var t = e.target, rm = t.closest('[data-ccrm]'), del = t.closest('[data-ccdel]'), add = t.closest('[data-ccadd]');
      if (rm) { var row = rm.closest('.row'); row.classList.toggle('confirm'); return; }
      if (del) { var id = del.dataset.ccdel; self.ccList = self.ccList.filter(function (x) { return x !== id; }); self.ccChanged(id, 'remove'); return; }
      if (add) { self.ccList.push(add.dataset.ccadd); self.ccChanged(add.dataset.ccadd, 'add'); }
    });
    app.addEventListener('pointerdown', function (e) {
      if (self.scene !== 'ccsettings') return;
      var g = e.target.closest('.grip'); if (!g) return;
      e.preventDefault(); self._cd = { id: g.dataset.grip, y0: e.clientY, dragging: false, row: g.closest('.row') };
    });
    this._cm = function (e) {
      var d = self._cd; if (!d) return;
      if (!d.dragging && Math.abs(e.clientY - d.y0) / (self.scale || 1) > 6) { d.dragging = true; d.row.classList.add('lift'); }
      if (d.dragging) {
        app.querySelectorAll('.hover').forEach(function (x) { x.classList.remove('hover'); });
        var el = document.elementFromPoint(e.clientX, e.clientY), r = el && el.closest('.row[data-cc]');
        if (r && r !== d.row) r.classList.add('hover');
      }
    };
    this._cu = function (e) {
      var d = self._cd; self._cd = null; if (!d || !d.dragging) return;
      self._noClick = Date.now();
      var el = document.elementFromPoint(e.clientX, e.clientY), r = el && el.closest('.row[data-cc]');
      if (r && r !== d.row) {
        var L = self.ccList, from = L.indexOf(d.id), to = L.indexOf(r.dataset.cc);
        L.splice(from, 1); L.splice(to, 0, d.id); self.ccChanged(d.id, 'move');
      } else self.ccChanged(d.id, null);
    };
    window.addEventListener('pointermove', this._cm); window.addEventListener('pointerup', this._cu);
  };
  P.ccCellAt = function (e) {
    var t = document.elementFromPoint(e.clientX, e.clientY), c = t && t.closest('.cc-b[data-ccid]'); if (c) return c;
    var best = null, bd = 1e9, sc = this.scale || 1;
    this.root.querySelectorAll('.p-panel .cc-b[data-ccid]').forEach(function (el) {
      var r = el.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < bd) { bd = d; best = el; }
    });
    return bd < 90 * sc ? best : null;
  };
  P.ccGalleryHtml = function () {
    var self = this, avail = Object.keys(CC).filter(function (id) { return self.ccList.indexOf(id) < 0; });
    return '<div class="cc-gal"><div class="cg-h">Añadir un control<span data-ccedit="closeg" role="button">Cerrar</span></div>' +
      (avail.length ? avail.map(function (id) { return '<div class="cg-row" data-ccpick="' + id + '" role="button"><span class="ti">' + CC[id][0] + '</span><b>' + CC[id][1] + '</b><i>+</i></div>'; }).join('') : '<p>Ya has añadido todos los controles.</p>') + '</div>';
  };
  P.ccChanged = function (id, what) {
    var top = this.q('.p-app').scrollTop;
    this.renderScene('ccsettings', {}); this.q('.p-app').scrollTop = top;
    if (what) this.emit('ccEdit', { list: this.ccList.slice(), id: id, what: what });
  };
  var unbind = P.unbindNav;
  P.unbindNav = function () {
    unbind.call(this);
    ['_qm', '_cm', '_pm'].forEach(function (k) { window.removeEventListener('pointermove', this[k]); }, this);
    ['_qu', '_cu', '_pu'].forEach(function (k) { window.removeEventListener('pointerup', this[k]); window.removeEventListener('pointercancel', this[k]); }, this);
  };

  AM.SCENES.ccsettings = function (p) {
    var inc = p.ccList, more = Object.keys(CC).filter(function (id) { return inc.indexOf(id) < 0; });
    return '<div class="sc sett"><div class="nav-h"><span class="bk" data-back>‹ Ajustes</span><b>Centro de control</b><span></span></div>' +
      '<div class="sect">Controles incluidos</div><div class="list">' + inc.map(function (id) {
        return '<div class="row cs" data-cc="' + id + '"><i class="mn" data-ccrm="' + id + '" role="button" aria-label="Quitar">−</i><span class="lbl">' + CC[id][1] + '</span>' +
          '<b class="del" data-ccdel="' + id + '" role="button">Eliminar</b><u class="grip" data-grip="' + id + '" aria-label="Mover">≡</u></div>';
      }).join('') + '</div>' +
      '<div class="sect">Más controles</div><div class="list">' + (more.length ? more.map(function (id) {
        return '<div class="row cs" data-more="' + id + '"><i class="pl" data-ccadd="' + id + '" role="button" aria-label="Añadir">+</i><span class="lbl">' + CC[id][1] + '</span></div>';
      }).join('') : '<div class="row">No queda ninguno por añadir</div>') + '</div></div>';
  };
})();
