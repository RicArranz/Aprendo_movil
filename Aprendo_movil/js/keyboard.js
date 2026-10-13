/* Teclado simulado: Gboard (Android) y teclado de Apple (iPhone), en español.
   Reproduce lo que cambia de verdad entre los dos: dónde está @, #, la coma, el punto, etc. */
(function () {
  'use strict';
  var AM = window.AM, svg = AM.svg, svgS = AM.svgS, IC = AM.IC, IS = AM.IS, esc = AM.esc, sleep = AM.sleep;
  var LETTER = /^[a-zñ]$/;
  /* al mantener pulsada una vocal salen sus tildes */
  var ACC = { a: ['á', 'à', 'ä', 'â'], e: ['é', 'è', 'ë', 'ê'], i: ['í', 'ì', 'ï', 'î'], o: ['ó', 'ò', 'ö', 'ô'], u: ['ú', 'ù', 'ü', 'û'] };
  var ACCBASE = {}; Object.keys(ACC).forEach(function (b) { ACC[b].forEach(function (c) { ACCBASE[c] = b; }); });
  var DICT = ('hola hoy casa amigo amiga buenos buenas días gracias tengo nietos nieto estoy bien mucho mensaje teléfono correo mañana tarde noche sol ' +
    'familia abuelo abuela hija hijo cómo estás quiero aprender móvil escribir teclado años ya sé marta pedro ana').split(' ');

  function ch(c, o) { return Object.assign({ k: c, l: c, c: 'ch' }, o || {}); }
  function L(s) { return s.split('').map(function (c) { return ch(c); }); }

  function enterKey(os, enter) {
    if (os === 'android') {
      var ic = { newline: svg(IC.enter, 24), search: svgS(IS.search, 22), next: svg(IC.arrow, 22), done: svg(IC.check, 24), go: svg(IC.arrow, 22), send: svg(IC.send, 22) };
      return { k: 'enter', l: ic[enter] || ic.newline, c: 'fn act', f: 1.6 };
    }
    var t = { newline: 'intro', search: 'buscar', next: 'siguiente', done: 'OK', go: 'ir', send: 'enviar' };
    return { k: 'enter', l: t[enter] || 'intro', c: 'fn act' + (enter !== 'newline' ? ' blue' : ''), f: enter === 'next' ? 3.2 : 2.4 };
  }

  /* nombres de las páginas del teclado y a cuál se puede ir directamente desde cada una */
  var PAGES = { android: ['abc', 'sym', 'sym2'], ios: ['abc', 'num', 'sym'] };

  function rows(os, page, type, enter) {
    var E = enterKey(os, enter);
    var space = { k: 'space', l: os === 'ios' ? 'espacio' : 'Español', c: 'space', f: os === 'ios' ? 5 : 4.4 };
    var emoji = { k: 'emoji', l: svgS(IS.emoji, 22), c: 'fn' };
    var back = { k: 'back', l: svg(IC.backspace, 24), c: 'fn back', f: 1.4 };
    if (page === 'tel') return telRows(os);
    if (os === 'android') {
      if (page === 'abc') {
        var r1 = L('qwertyuiop').map(function (k, i) { k.h = String((i + 1) % 10); return k; });
        var r3 = [{ k: 'shift', l: svg(IC.shift, 24), c: 'fn shift', f: 1.4 }].concat(L('zxcvbnm'), [back]);
        /* en Android la @ se busca siempre en ?123 (también en los cuadros de correo) */
        var r4 = [{ k: 'sym', l: '?123', c: 'fn', f: 1.6 }, ch(',', { c: 'ch fn' }), emoji, space, ch('.', { c: 'ch fn' }), E];
        return [r1, L('asdfghjklñ'), r3, r4];
      }
      var bottom = [{ k: 'abc', l: 'ABC', c: 'fn', f: 1.6 }, ch(',', { c: 'ch fn' }), space, ch('.', { c: 'ch fn' }), E];
      if (page === 'sym') {
        return [L('1234567890'), '@#€_&-+()/'.split('').map(function (c) { return ch(c); }),
          [{ k: 'sym2', l: '=\\&lt;', c: 'fn', f: 1.4 }].concat('*"\':;!?'.split('').map(function (c) { return ch(c); }), [back]), bottom];
      }
      return [('~`|•√π÷×¶∆').split('').map(function (c) { return ch(c); }), ('£¢€¥^°={}\\').split('').map(function (c) { return ch(c); }),
        [{ k: 'sym', l: '?123', c: 'fn', f: 1.4 }].concat('%©®™✓[]'.split('').map(function (c) { return ch(c); }), [back]), bottom];
    }
    /* iPhone */
    var sh = { k: 'shift', l: svg(IC.shift, 22), c: 'fn shift', f: 1.4 };
    if (page === 'abc') {
      var b4 = type === 'email'
        ? [{ k: 'num', l: '123', c: 'fn', f: 1.5 }, emoji, ch('@', { c: 'ch', f: 1 }), space, ch('.', { c: 'ch' }), E]
        : [{ k: 'num', l: '123', c: 'fn', f: 1.7 }, emoji, space, E];
      if (type === 'email') space.f = 3.4;
      return [L('qwertyuiop'), L('asdfghjklñ'), [sh].concat(L('zxcvbnm'), [back]), b4];
    }
    var b4n = [{ k: 'abc', l: 'ABC', c: 'fn', f: 1.7 }, emoji, space, E];
    if (page === 'num') {
      return [L('1234567890'), '-/:;()€&@"'.split('').map(function (c) { return ch(c); }),
        [{ k: 'sym', l: '#+=', c: 'fn', f: 1.5 }].concat('.,?!\''.split('').map(function (c) { return ch(c, { f: 1.2 }); }), [back]), b4n];
    }
    return [('[]{}#%^*+=').split('').map(function (c) { return ch(c); }), ('_\\|~<>$£¥•').split('').map(function (c) { return ch(c); }),
      [{ k: 'num', l: '123', c: 'fn', f: 1.5 }].concat('.,?!\''.split('').map(function (c) { return ch(c, { f: 1.2 }); }), [back]), b4n];
  }

  function telRows(os) {
    var d = function (n, sub) { return { k: n, l: os === 'ios' ? '<b style="font-weight:400">' + n + '</b><small>' + (sub || '&nbsp;') + '</small>' : n, c: 'ch' }; };
    var subs = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
    var R = function (a) { return a.map(function (n) { return d(n, subs[n]); }); };
    var back = { k: 'back', l: svg(IC.backspace, 26), c: 'fn back' };
    if (os === 'ios') return [R(['1', '2', '3']), R(['4', '5', '6']), R(['7', '8', '9']), [{ k: '+', l: '+ * #', c: 'ch fn' }, d('0', '+'), back]];
    return [R(['1', '2', '3']).concat([back]), R(['4', '5', '6']).concat([ch('-', { c: 'ch fn' })]), R(['7', '8', '9']).concat([ch('.', { c: 'ch fn' })]),
      [ch('*', { c: 'ch fn' }), d('0'), ch('#', { c: 'ch fn' }), { k: 'enter', l: svg(IC.check, 26), c: 'fn act' }]];
  }

  function Keyboard(phone) {
    this.p = phone; this.os = phone.os; this.el = phone.q('.p-kbd');
    this.fid = null; this.cfg = null; this.page = 'abc'; this.shift = 'off'; this.locked = false; this.assistKid = null; this._ls = 0; this._run = 0;
    var self = this;
    this.el.addEventListener('pointerdown', function (e) {
      var k = e.target.closest('.k'), s = e.target.closest('.sug');
      if (s && s.dataset.clip) { e.preventDefault(); if (!self.locked) self.p.pasteInto(self.fid); return; }
      if (s) { e.preventDefault(); self.suggest(s.dataset.w); return; }
      var ai = e.target.closest('.acc-i');
      if (ai) { e.preventDefault(); if (!self.locked) self.chooseAcc(ai.dataset.ch); return; }
      if (self.el.querySelector('.acc-pop')) self.closeAcc();
      if (!k) return;
      e.preventDefault();
      if (self.locked) return;
      var kid = k.dataset.kid;
      if (ACC[kid] && self.page === 'abc') {   /* vocal: se escribe al soltar, salvo que se mantenga pulsada */
        self.flash(k);
        self._acc = { kid: kid, shown: false, t: setTimeout(function () { if (self._acc) { self._acc.shown = true; self.showAcc(kid); } }, 380) };
        return;
      }
      self.press(kid);
      self.flash(k);
      if (kid === 'back') self.holdBack();
    });
    window.addEventListener('pointerup', this._ku = function (e) {
      var a = self._acc; if (!a) return;
      clearTimeout(a.t); self._acc = null;
      if (!a.shown) { if (self.fid && !self.locked) self.press(a.kid); return; }
      var t = document.elementFromPoint(e.clientX, e.clientY), ai = t && t.closest('.acc-i');
      if (ai) self.chooseAcc(ai.dataset.ch);
    });
    var stop = function () { self.stopHold(); };
    this.el.addEventListener('pointerleave', stop);
    window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop);
  }
  var K = Keyboard.prototype;

  K.showAcc = function (base) {
    this.closeAcc();
    var kel = this.keyEl(base); if (!kel) return;
    var up = this.shift !== 'off', sc = this.p.scale || 1;
    var pop = document.createElement('div'); pop.className = 'acc-pop';
    pop.innerHTML = ACC[base].map(function (c) { var ch = up ? c.toLocaleUpperCase('es') : c; return '<div class="acc-i" data-ch="' + ch + '">' + ch + '</div>'; }).join('');
    this.el.appendChild(pop); kel.classList.add('acc-base');
    var kr = kel.getBoundingClientRect(), er = this.el.getBoundingClientRect();
    var w = pop.offsetWidth, x = (kr.left - er.left) / sc + kr.width / sc / 2 - w / 2;
    pop.style.left = Math.max(2, Math.min(x, this.el.clientWidth - w - 2)) + 'px'; pop.style.top = ((kr.top - er.top) / sc - 66) + 'px';
  };
  K.closeAcc = function () {
    var p = this.el.querySelector('.acc-pop'); if (p) p.remove();
    this.el.querySelectorAll('.acc-base').forEach(function (x) { x.classList.remove('acc-base'); });
  };
  K.chooseAcc = function (ch) { this.closeAcc(); if (!this.fid) return; this.clearAssist(); this.put(ch, ch); };
  K.val = function () { return this.p.getValue(this.fid); };
  K.type = function () { return this.cfg ? this.cfg.type : 'text'; };
  K.open = function (fid, cfg) {
    var changed = this.fid !== fid;
    this.fid = fid; this.cfg = cfg;
    if (changed) { this.page = cfg.type === 'tel' ? 'tel' : 'abc'; this.shift = 'off'; this.autoShift(); }
    this.render(); this.el.classList.add('open');
  };
  K.reset = function () {
    if (!this.cfg) return;
    this.page = this.type() === 'tel' ? 'tel' : 'abc'; this.shift = 'off'; this.autoShift(); this.render();
  };
  K.close = function () { this.fid = null; this.cfg = null; this.el.classList.remove('open'); this.el.innerHTML = ''; this.assistKid = null; };

  K.autoShift = function (force) {
    if (!this.cfg || this.page !== 'abc') return;
    var t = this.type(); if (t !== 'text' || this.cfg.cap === false) return;
    var v = this.val();
    if (this.shift === 'caps') return;
    if (!v.trim() || /[.!?]\s+$/.test(v) || /\n$/.test(v)) this.shift = 'once'; else if (this.shift === 'once' || force) this.shift = 'off';
  };

  K.suggestions = function () {
    if (this.type() === 'tel' || this.type() === 'email') return null;
    var v = this.val(), m = v.match(/(\S*)$/), w = m ? m[1] : '';
    if (!w) return ['Hola', 'Gracias', 'Buenos'];
    var lw = w.toLowerCase(), cap = w[0] !== w[0].toLowerCase();
    var hits = DICT.filter(function (x) { return x.indexOf(lw) === 0 && x !== lw; }).slice(0, 3);
    if (!hits.length) return ['“' + w + '”', '', ''];
    return hits.map(function (x) { return cap ? x[0].toUpperCase() + x.slice(1) : x; });
  };
  K.suggest = function (w) {
    if (!w || w[0] === '“' || this.locked) return;
    var v = this.val(), nv = v.replace(/\S*$/, '') + w + ' ';
    this.p.setValue(this.fid, nv); this.autoShift(); this.render();
    this.p.emit('input', { id: this.fid, value: nv });
  };

  K.render = function () {
    if (!this.cfg) return;
    var self = this, t = this.type(), rs = rows(this.os, this.page, t, this.cfg.enter);
    var sg = this.page === 'tel' ? null : this.suggestions();
    var c = this.p.clip, chip = '';
    if (sg && this.os === 'android' && c && !this.val() && (c.type === 'text' || this.fid === 'msg')) {
      chip = '<div class="sug clip" data-clip="1">📋 ' + esc(c.type === 'text' ? (c.text.length > 13 ? c.text.slice(0, 12) + '…' : c.text) : 'Imagen') + '</div>';
      sg = sg.slice(0, 2);
    }
    var bar = sg ? '<div class="k-bar">' + chip + sg.map(function (w) { return '<div class="sug" data-w="' + esc(w) + '">' + esc(w) + '</div>'; }).join('') + '</div>' : '';
    var up = this.shift !== 'off';
    var html = rs.map(function (r) {
      return '<div class="kr">' + r.map(function (k) {
        var lbl = k.l, cls = k.c;
        if (k.c.indexOf('ch') === 0 && LETTER.test(k.k) && up) lbl = k.k.toLocaleUpperCase('es');
        if (k.k === 'shift') cls += this.shift === 'caps' ? ' on caps' : (this.shift === 'once' ? ' on' : '');
        return '<div class="k ' + cls + '" data-kid="' + esc(k.k) + '" style="flex:' + (k.f || 1) + '">' + (k.h && self.os === 'android' ? '<span class="hint">' + k.h + '</span>' : '') + '<span class="kl">' + lbl + '</span></div>';
      }, self).join('') + '</div>';
    }).join('');
    this.el.innerHTML = '<div class="keyb' + (this.page === 'tel' ? ' tel' : '') + '">' + bar + html + '</div>';
    if (this.assistKid) this.setAssist(this.assistKid);
  };

  K.keyEl = function (kid) {
    if (kid && kid.indexOf('acc:') === 0) kid = ACCBASE[kid.slice(4).toLowerCase()];
    var all = this.el.querySelectorAll('.k');
    for (var i = 0; i < all.length; i++) if (all[i].dataset.kid === kid) return all[i];
    return null;
  };
  K.flash = function (el) {
    el.classList.add('down');
    var kid = el.dataset.kid;
    if (/^[^\s]$/.test(kid) || kid.length === 1) {
      var pop = document.createElement('div'); pop.className = 'pop'; pop.textContent = el.querySelector('.kl').textContent;
      if (!el.classList.contains('fn') || kid === ',' || kid === '.') el.appendChild(pop);
      setTimeout(function () { pop.remove(); }, 160);
    }
    setTimeout(function () { el.classList.remove('down'); }, 120);
  };
  K.holdBack = function () {
    var self = this; this.stopHold();
    this._h1 = setTimeout(function () { self._h2 = setInterval(function () { self.press('back'); }, 90); }, 450);
  };
  K.stopHold = function () { clearTimeout(this._h1); clearInterval(this._h2); };

  K.setAssist = function (kid) {
    this.clearAssist(); this.assistKid = kid;
    var e = kid && this.keyEl(kid); if (e) e.classList.add('assist');
  };
  K.clearAssist = function () { this.el.querySelectorAll('.assist').forEach(function (e) { e.classList.remove('assist'); }); this.assistKid = null; };

  K.press = function (kid) {
    if (!this.fid) return;
    var p = this.p;
    this.clearAssist();
    if (kid === 'shift') {
      var now = Date.now();
      if (this.shift === 'caps') this.shift = 'off';
      else if (now - this._ls < 350) this.shift = 'caps';
      else this.shift = this.shift === 'off' ? 'once' : 'off';
      this._ls = now; this.render(); p.emit('key', { kid: kid }); return;
    }
    if (kid === 'back') {
      var v = this.val(); if (v.length) p.setValue(this.fid, v.slice(0, -1));
      this.autoShift(); this.render(); p.emit('key', { kid: kid }); p.emit('input', { id: this.fid, value: this.val() }); return;
    }
    if (PAGES[this.os].indexOf(kid) >= 0) { this.page = kid; this.render(); p.emit('key', { kid: kid }); return; }
    if (kid === 'emoji') { p.toast('Los emojis los veremos otro día 😊'); return; }
    if (kid === 'enter') { this.enter(); return; }
    var out;
    if (kid === 'space') { out = ' '; if (this.os === 'ios' && this.page !== 'abc') this.page = 'abc'; }
    else if (LETTER.test(kid)) out = this.shift === 'off' ? kid : kid.toLocaleUpperCase('es');
    else out = kid;
    this.put(out, kid);
  };
  K.put = function (out, kid) {
    var p = this.p;
    p.setValue(this.fid, this.val() + out);
    if (this.shift === 'once') this.shift = 'off';
    this.autoShift(); this.render();
    p.emit('key', { kid: kid, out: out }); p.emit('input', { id: this.fid, value: this.val() });
  };

  K.enter = function () {
    var p = this.p, c = this.cfg, id = this.fid;
    if (c.enter === 'newline') {
      p.setValue(id, this.val() + '\n'); this.autoShift(); this.render();
      p.emit('key', { kid: 'enter' }); p.emit('input', { id: id, value: this.val() }); return;
    }
    p.emit('key', { kid: 'enter' }); p.emit('submit', { id: id, enter: c.enter });
    if (c.enter === 'next' && c.next && p.fcfg[c.next]) { p.focus(c.next); return; }
    if (c.enter === 'search') p.toast('Aquí saldrían los resultados de la búsqueda.');
    p.hideKb();
  };

  /* ---------- planificador: ¿qué tecla hay que pulsar ahora para escribir "target"? ---------- */
  K.findPage = function (ch) {
    var os = this.os, t = this.type(), order = [this.page].concat(PAGES[os].filter(function (x) { return x !== this.page; }, this));
    for (var i = 0; i < order.length; i++) {
      var rs = rows(os, order[i], t, 'newline');
      for (var r = 0; r < rs.length; r++) for (var j = 0; j < rs[r].length; j++) if (rs[r][j].k === ch) return order[i];
    }
    return null;
  };
  K.navKey = function (target) {
    var os = this.os, pg = PAGES[os];
    if (target === 'abc') return 'abc';
    if (this.page === 'abc') return pg[1];           /* de las letras se va a la 1.ª página de símbolos */
    return target;                                    /* entre páginas de símbolos: directo */
  };
  K.keyFor = function (c) {
    if (c === ' ') return 'space';
    if (c === '\n') return 'enter';
    if (this.page === 'tel') return c;
    var lower = c.toLowerCase();
    if (ACCBASE[lower]) {
      if (this.page !== 'abc') return 'abc';
      var wu = c !== lower, iu = this.shift !== 'off';
      if (wu !== iu) return 'shift';
      return 'acc:' + c;
    }
    if (LETTER.test(lower)) {
      if (this.page !== 'abc') return 'abc';
      var wantUp = c !== lower, isUp = this.shift !== 'off';
      if (wantUp !== isUp) return 'shift';
      return lower;
    }
    var pg = this.findPage(c); if (!pg) return null;
    if (pg === this.page) return c;
    return this.navKey(pg);
  };
  K.nextKey = function (target) {
    var v = this.val();
    if (v === target) return null;
    if (target.indexOf(v) !== 0) return 'back';
    return this.keyFor(target.charAt(v.length));
  };

  /* demostración: el dedo va pulsando las teclas una a una */
  K.demo = function (target, alive) {
    var self = this, run = ++this._run, guard = 0;
    this.locked = true;
    var step = function () {
      if (self._run !== run || (alive && !alive())) { self.locked = false; return Promise.resolve(false); }
      var k = self.nextKey(target);
      if (!k || guard++ > 90) { self.locked = false; self.p.hideFinger(); return Promise.resolve(true); }
      var el = self.keyEl(k);
      if (!el) { self.locked = false; return Promise.resolve(false); }
      if (k.indexOf('acc:') === 0) {
        var ch = k.slice(4), base = ACCBASE[ch.toLowerCase()];
        return self.p.pointAt(el).then(function () { el.classList.add('demo'); self.showAcc(base); return AM.wait(1100); }).then(function () {
          var v = self.el.querySelector('.acc-i[data-ch="' + ch + '"]'); if (!v) return null;
          return self.p.pointAt(v, true).then(function () { self.chooseAcc(ch); return AM.wait(320); });
        }).then(function () { var e2 = self.keyEl(base); if (e2) e2.classList.remove('demo'); return step(); });
      }
      return self.p.pointAt(el).then(function () {
        el.classList.add('demo');
        self.flash(el);
        self.press(k);
        return AM.wait(320);
      }).then(function () {
        var e2 = self.keyEl(k); if (e2) e2.classList.remove('demo');
        return step();
      });
    };
    return step();
  };
  K.cancelDemo = function () { this._run++; this.locked = false; this.p.hideFinger(); };

  AM.Keyboard = Keyboard;
})();
