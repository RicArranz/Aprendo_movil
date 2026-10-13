/* Pantallas de la web (elegir móvil, menú, lección) y el motor que lleva el ejercicio. */
(function () {
  'use strict';
  var AM = window.AM, S = AM.store, sleep = AM.sleep;
  var view = document.getElementById('view');
  var runner = null;

  /* ---------- utilidades ---------- */
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 3000);
  }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function chime() {
    if (!S.get().sound) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext, c = new C(); [523, 659, 784].forEach(function (f, i) {
        var o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.type = 'sine'; o.connect(g); g.connect(c.destination);
        g.gain.setValueAtTime(.0001, c.currentTime + i * .13); g.gain.exponentialRampToValueAtTime(.2, c.currentTime + i * .13 + .03); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + i * .13 + .3);
        o.start(c.currentTime + i * .13); o.stop(c.currentTime + i * .13 + .32);
      });
    } catch (e) { /* sin sonido */ }
  }
  var PRAISE = ['Muy bien.', 'Hecho.', 'Correcto.', 'Bien hecho.'];
  var TICK = '<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#e3f4e8"/><path d="M14 25l7 7 13-15" fill="none" stroke="#2f7d4f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /* iconos sencillos de cada módulo */
  var MODICON = {
    field: '<rect x="3" y="7" width="18" height="10" rx="2.5"/><path d="M8 10.5v3"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    switches: '<path d="M4 8h16M4 16h16"/><circle cx="9" cy="8" r="2.4" fill="#fff"/><circle cx="15" cy="16" r="2.4" fill="#fff"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 4.5h6v2.5H9zM8.5 12h7M8.5 16h5"/>'
  };
  function modIcon(k) { return '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (MODICON[k] || MODICON.grid) + '</svg>'; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function osName(os) { return os === 'ios' ? 'iPhone' : 'Android'; }

  /* ---------- cabecera ---------- */
  function setupHeader() {
    document.getElementById('bMenuTop').onclick = function () { go(S.get().os ? '#/menu' : '#/'); };
    var fsStep = function (d) { var f = Math.max(16, Math.min(32, S.get().fs + d)); S.set({ fs: f }); document.documentElement.style.setProperty('--fs', f + 'px'); if (runner) runner.fit(); };
    document.getElementById('bSmaller').onclick = function () { fsStep(-2); };
    document.getElementById('bBigger').onclick = function () { fsStep(2); };
    var snd = document.getElementById('bSound');
    var paint = function () { snd.textContent = S.get().sound ? '🔊' : '🔇'; snd.setAttribute('aria-label', S.get().sound ? 'Sonido activado' : 'Sonido apagado'); };
    snd.onclick = function () { S.set({ sound: !S.get().sound }); paint(); if (S.get().sound) chime(); };
    paint();
  }

  /* ---------- elegir móvil ---------- */
  var SVG_ROBOT = '<svg viewBox="8 8 48 36" width="110" height="82" aria-hidden="true"><path d="M12 40a20 20 0 0140 0z" fill="#3ddc84"/><circle cx="24" cy="31" r="2.6" fill="#073042"/><circle cx="40" cy="31" r="2.6" fill="#073042"/><path d="M18 14l5 8M46 14l-5 8" stroke="#3ddc84" stroke-width="3.2" stroke-linecap="round"/></svg>';
  var SVG_APPLE = '<span style="font-size:4.6rem;line-height:84px;display:block" aria-hidden="true">🍎</span>';
  var SVG_BTN_PHONE = '<svg viewBox="0 0 60 100" width="60" height="100" aria-hidden="true"><rect x="3" y="3" width="54" height="94" rx="9" fill="#fff" stroke="#1d2433" stroke-width="4"/><circle cx="30" cy="84" r="7" fill="none" stroke="#1d2433" stroke-width="4"/><rect x="10" y="12" width="40" height="58" rx="3" fill="#dbe4ff"/></svg>';
  var SVG_NOTCH_PHONE = '<svg viewBox="0 0 60 100" width="60" height="100" aria-hidden="true"><rect x="3" y="3" width="54" height="94" rx="14" fill="#fff" stroke="#1d2433" stroke-width="4"/><rect x="21" y="9" width="18" height="6" rx="3" fill="#1d2433"/><rect x="8" y="20" width="44" height="66" rx="3" fill="#dbe4ff"/><rect x="21" y="90" width="18" height="3" rx="1.5" fill="#1d2433"/></svg>';

  function welcome(step2) {
    var h = '<div class="wrap">';
    if (!step2) {
      h += '<div class="hero"><h2>Aprende a usar tu móvil</h2><p>Paso a paso, sin prisa y sin miedo a equivocarte.<br>Aquí <b>no se puede romper nada</b>.</p></div>' +
        '<h2 style="text-align:center;font-size:1.7rem;margin:.4rem 0">¿Qué móvil tienes?</h2>' +
        '<div class="choices"><button class="choice" data-os="ios"><span class="big">' + SVG_APPLE + '</span><b>1 · iPhone</b><small>Tiene una manzanita 🍎 detrás</small></button>' +
        '<button class="choice" data-os="android"><span class="big">' + SVG_ROBOT + '</span><b>2 · Android</b><small>Samsung, Xiaomi, Motorola, Huawei…</small></button></div>' +
        '<div class="help-box">💡 <b>¿No lo sabes?</b> Dale la vuelta al móvil: si ves una <b>manzana</b>, es un iPhone. Si no, casi seguro es Android. También puedes preguntar a tu profesor/a.</div>';
    } else {
      h += '<div class="hero"><h2>Una pregunta más</h2><p>Los iPhone nuevos y los antiguos se manejan un poco distinto.</p></div>' +
        '<h2 style="text-align:center;font-size:1.5rem;margin:.4rem 0">¿Tu iPhone tiene un botón redondo abajo?</h2>' +
        '<div class="minis"><button class="choice" data-home="button">' + SVG_BTN_PHONE + '<b>Sí, tiene botón</b><small>Un círculo debajo de la pantalla</small></button>' +
        '<button class="choice" data-home="notch">' + SVG_NOTCH_PHONE + '<b>No, no tiene</b><small>La pantalla ocupa todo el frente</small></button></div>' +
        '<p class="who"><button class="linkbtn" id="back1">← Volver</button></p>';
    }
    view.innerHTML = h + '</div>';
    view.querySelectorAll('[data-os]').forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.os === 'ios') { welcome(true); return; }
        S.set({ os: 'android', iosHome: null }); go('#/menu');
      };
    });
    view.querySelectorAll('[data-home]').forEach(function (b) { b.onclick = function () { S.set({ os: 'ios', iosHome: b.dataset.home }); go('#/menu'); }; });
    var b1 = document.getElementById('back1'); if (b1) b1.onclick = function () { welcome(false); };
    window.scrollTo(0, 0);
  }

  /* ---------- menú ---------- */
  function menu() {
    var st = S.get(), L = AM.buildLessons(st.os, st.iosHome), os = st.os;
    var pos = st.pos[os], total = 0, done = 0;
    L.forEach(function (m, mi) { m.steps.forEach(function (s, si) { total++; if (S.isDone(os, mi + 1, si)) done++; }); });
    var h = '<div class="wrap"><div class="hero"><h2>' + (done === total ? 'Has completado todos los módulos' : 'Elige qué quieres practicar') + '</h2>' +
      '<p>Móvil: <b>' + osName(os) + (os === 'ios' ? (st.iosHome === 'button' ? ' (con botón)' : ' (sin botón)') : '') + '</b> · ' + done + ' de ' + total + ' ejercicios hechos</p></div>';
    if (pos && L[pos.m - 1] && L[pos.m - 1].steps[pos.s] && done < total) {
      h += '<div class="resume"><p>👉 <b>Sigue donde lo dejaste</b><br><small>Módulo ' + pos.m + ' · ' + L[pos.m - 1].steps[pos.s].title + '</small></p><a class="btn good" href="#/m/' + pos.m + '/' + pos.s + '">Continuar ▶</a></div>';
    }
    h += '<div class="cards">';
    L.forEach(function (m, mi) {
      var n = m.steps.length, d = m.steps.filter(function (s, si) { return S.isDone(os, mi + 1, si); }).length;
      var first = 0; for (var i = 0; i < n; i++) { if (!S.isDone(os, mi + 1, i)) { first = i; break; } }
      h += '<div class="card"><div class="ico">' + modIcon(m.icon) + '</div><h3>Módulo ' + (mi + 1) + ' · ' + m.title + '</h3><p>' + m.desc + '</p>' +
        '<div><div class="bar"><i style="width:' + Math.round(d / n * 100) + '%"></i></div><div class="acts"><a class="btn" href="#/m/' + (mi + 1) + '/' + (d === n ? 0 : first) + '">' + (d === 0 ? 'Empezar' : d === n ? 'Repetir' : 'Seguir') + ' ▶</a><small>' + d + ' de ' + n + '</small></div></div>' +
        '<details><summary>Ver todos los ejercicios</summary><ol>' + m.steps.map(function (s, si) { return '<li class="' + (S.isDone(os, mi + 1, si) ? 'done' : '') + '"><a href="#/m/' + (mi + 1) + '/' + si + '">' + s.title + '</a></li>'; }).join('') + '</ol></details></div>';
    });
    h += '</div><p class="who"><button class="linkbtn" id="chg">Cambiar de móvil</button> · <button class="linkbtn" id="rst">Borrar mi progreso</button></p></div>';
    view.innerHTML = h;
    document.getElementById('chg').onclick = function () { go('#/elegir'); };
    document.getElementById('rst').onclick = function () { if (confirm('¿Seguro que quieres borrar todo tu progreso?')) { S.reset(); go('#/'); } };
    window.scrollTo(0, 0);
  }

  /* ---------- lección ---------- */
  function lesson(mi, si) {
    var st = S.get(), os = st.os, L = AM.buildLessons(os, st.iosHome), mod = L[mi - 1];
    if (!mod || !mod.steps[si]) { go('#/menu'); return; }
    view.innerHTML =
      '<section class="lesson"><aside class="coach" aria-live="polite"><div class="where"><span id="cw"></span><span id="cs"></span></div><div class="dots" id="dots"></div>' +
      '<h2 id="ct"></h2><div class="sub" id="csub" hidden></div><div class="say" id="say"></div><div class="mira" id="mira">👀 Mira con atención…</div><div class="fb" id="fb"></div>' +
      '<div class="row"><button class="btn alt small" id="bShow">👀 Enséñame</button><button class="btn alt small" id="bHint">💡 Pista</button><button class="btn alt small" id="bRepeat" title="Empezar este ejercicio otra vez">↻ Repetir</button></div>' +
      '<div class="foot"><button class="linkbtn" id="bMenu">← Menú</button><button class="linkbtn" id="bSkip">Saltar ejercicio ▶</button></div></aside>' +
      '<div class="stage"><div class="stagebox" id="stagebox"><div id="phoneHost"></div></div></div></section><button class="fab" id="bUp" hidden>⬆ Ver las instrucciones</button><div class="cele" id="cele" hidden></div>';
    var $ = function (id) { return document.getElementById(id); };
    var phone = new AM.Phone($('phoneHost'), os, { iosHome: st.iosHome }), kb = phone.kb;
    var curSi = si, step, task, ti = 0, tok = 0, sceneKey = null, done = false, demoing = false, assistOn = false, misses = 0, reverting = false, dead = false;
    var idleT = null, fbT = null, timers = [];

    var fit = function () {
      if (dead) return;
      var box = $('stagebox'), les = document.querySelector('.lesson'), coach = document.querySelector('.coach'), hd = document.querySelector('.top');
      var narrow = window.innerWidth <= 820, sc;
      document.documentElement.style.setProperty('--hh', hd.getBoundingClientRect().height + 'px');
      coach.classList.remove('stick');
      coach.classList.toggle('nostick', !narrow && coach.offsetHeight > window.innerHeight - 90);
      var top = box.getBoundingClientRect().top + window.scrollY;
      var availW = Math.max((narrow ? les.clientWidth : les.clientWidth - 340), 200);
      if (narrow) {
        sc = Math.max(Math.min(availW / 360, 1.3), .7);   /* el móvil ocupa todo el ancho: grande y fácil */
      } else {
        sc = Math.max(Math.min((window.innerHeight - top - 14) / 740, availW / 360, 1.75), .5);
        if (window.innerHeight - top - 14 < 400) sc = Math.max(Math.min(availW / 360, 1), .55);
      }
      var host = $('phoneHost'); host.style.transform = 'scale(' + sc + ')'; host.style.transformOrigin = 'top left';
      host.style.width = '360px'; host.style.height = '740px';
      box.style.width = 360 * sc + 'px'; box.style.height = 740 * sc + 'px';
      phone.scale = sc;
    };
    var onScroll = function () { var c = document.querySelector('.coach'); if (c) $('bUp').hidden = !(c.getBoundingClientRect().bottom < 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', fit);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { fit(); }) : null; if (ro) ro.observe($('say'));
    fit(); setTimeout(fit, 60);

    var stale = function (t) { return dead || t !== tok; };
    var say = function (h) { $('say').innerHTML = h || ''; };
    var fb = function (h, good) { var e = $('fb'); e.innerHTML = h || ''; e.className = 'fb' + (h ? ' show' : '') + (good ? ' good' : ''); clearTimeout(fbT); if (h && good) fbT = setTimeout(function () { if (!dead) fb(''); }, 2500); };
    var armIdle = function () { clearTimeout(idleT); idleT = setTimeout(function () { if (!dead && !done && !demoing) { showHint(true); armIdle(); } }, 25000); };

    function dots() {
      $('dots').innerHTML = mod.steps.map(function (s, i) { return '<i class="' + (i === curSi ? 'now' : (S.isDone(os, mi, i) ? 'done' : '')) + '" title="' + s.title.replace(/"/g, '') + '"></i>'; }).join('');
    }

    function startStep(i) {
      curSi = i; step = mod.steps[i]; if (step.fresh) step.tasks = step.fresh();
      S.setPos(os, mi, i); history.replaceState(null, '', '#/m/' + mi + '/' + i);
      $('cw').textContent = 'Módulo ' + mi + ' · ' + mod.title; $('cs').textContent = 'Ejercicio ' + (i + 1) + ' de ' + mod.steps.length;
      $('ct').textContent = step.title; dots();
      sceneKey = null; phone.resetState(); $('cele').hidden = true;
      runTask(0);
      window.scrollTo(0, 0); fit();
    }

    function runTask(i) {
      tok++; var my = tok; ti = i; task = step.tasks[i]; done = false; demoing = false; misses = 0; assistOn = false; reverting = false;
      phone.off(onEvent); kb.cancelDemo(); phone.unring(); kb.clearAssist(); fb(''); $('mira').classList.remove('on');
      var key = task.scene + JSON.stringify(task.cfg || {});
      if (task.scene && key !== sceneKey) { phone.setScene(task.scene, task.cfg || {}); sceneKey = key; }
      if (task.type && task.type.prefill !== undefined) phone.setValue(task.type.field, task.type.prefill);
      if (task.setup) task.setup(phone);
      var multi = step.tasks.length > 1; $('csub').hidden = !multi; if (multi) $('csub').textContent = 'Paso ' + (i + 1) + ' de ' + step.tasks.length;
      var isDemo = task.type && task.type.demo;
      say(isDemo ? (task.explain || task.say) : task.say);
      $('bShow').hidden = !(isDemo || task.show);
      phone.on(onEvent);
      if (task.type) {
        assistOn = !!task.type.assist;
        if (isDemo) { timers.push(setTimeout(function () { if (!stale(my)) runDemo(my); }, 900 * (AM.slow == null ? 1 : AM.slow))); }
        else updateAssist();
      }
      if (task.skipIf && task.skipIf(phone)) timers.push(setTimeout(function () { if (!stale(my)) taskDone(); }, 500));
      armIdle();
    }

    function runDemo(my) {
      var t = task; if (!t.type) return;
      demoing = true; phone.unring(); fb(''); $('mira').classList.add('on'); say(t.explain || t.say);
      phone.setValue(t.type.field, t.type.prefill || ''); phone.focus(t.type.field); kb.reset();
      AM.wait(600).then(function () {
        if (stale(my)) return false;
        return kb.demo(t.type.target, function () { return !stale(my); });
      }).then(function (ok) {
        if (!ok || stale(my)) { if (!stale(my)) { demoing = false; $('mira').classList.remove('on'); } return; }
        return AM.wait(1500).then(function () {
          if (stale(my)) return;
          phone.setValue(t.type.field, t.type.prefill || ''); kb.reset();
          demoing = false; $('mira').classList.remove('on'); say(t.say); updateAssist(); armIdle();
        });
      });
    }

    function updateAssist() {
      if (!task || !task.type || done || demoing) return;
      var t = task.type;
      if (!assistOn) return;
      if (!phone.fid) { phone.ring('[data-fid="' + t.field + '"]'); kb.assistKid = null; return; }
      phone.unring();
      var k = kb.nextKey(t.target);
      if (k) kb.setAssist(k); else kb.clearAssist();
    }

    var hintOf = function () { var h = task && task.hint; return typeof h === 'function' ? h(phone) : h; };

    function showHint(auto) {
      if (!task || done || demoing) return;
      if (task.type) { assistOn = true; updateAssist(); fb(auto ? 'Te ayudo: mira lo que brilla en <b>naranja</b>.' : 'Te marco lo que toca en <b>naranja</b>.'); return; }
      var hs = hintOf(), ok = hs && phone.ring(hs);
      if (!ok && task.show) { task.show(phone); }
      fb(ok ? 'Mira lo que brilla en <b>naranja</b>: ahí es.' : (task.show ? 'Mira cómo se hace…' : 'Léelo con calma; no hay prisa.'));
    }

    function onEvent(ev) {
      if (dead || done || demoing || reverting) return;
      var t = task; armIdle();
      if (t.type) {
        if (ev.type === 'input' && ev.id === t.type.field) return checkType(ev.value);
        if (ev.type === 'key' || ev.type === 'focus' || ev.type === 'kbd') updateAssist();
        return;
      }
      if (t.want && ev.type === 'toggle') {
        if (ev.name === t.want.name && ev.on === t.want.on) { return taskDone(); }
        if (ev.name !== t.want.name) {
          fb('Ese era <b>otro</b> icono. Lo dejo como estaba: busca el que te digo.');
          reverting = true; setTimeout(function () { phone.toggle(ev.name, !ev.on); reverting = false; }, 900);
        }
        return;
      }
      if (t.goal && t.goal(ev, phone)) return taskDone();
      if (t.wrong) { var m = t.wrong(ev, phone); if (m) fb(m); }
      if (ev.type === 'miss' && hintOf()) { misses++; if (misses % 2 === 0) { phone.ring(hintOf()); fb('Casi. Mira lo que brilla en <b>naranja</b>: ahí tienes que tocar.'); } }
      if (ev.type === 'edgeTap') fb('Hay que <b>arrastrar</b> el dedo, no solo tocar. Pulsa «Enséñame» si quieres verlo.');
    }

    function checkType(v) {
      var tg = task.type.target;
      if (v.replace(/\s+$/, '') === tg) { return taskDone(); }
      if (tg.indexOf(v) !== 0) {
        fb('Esa tecla no era. No pasa nada: pulsa ' + (S.get().os === 'ios' ? '<kbd>⌫</kbd>' : '<kbd>⌫</kbd>') + ' para borrar y sigue.');
        kb.setAssist('back');
      } else { fb(''); updateAssist(); }
    }

    function taskDone() {
      if (done) return; done = true; clearTimeout(idleT); phone.unring(); kb.clearAssist(); chime();
      var my = tok;
      if (ti + 1 < step.tasks.length) {
        fb('Bien. ✔', true);
        timers.push(setTimeout(function () { if (!stale(my)) runTask(ti + 1); }, 1300));
      } else {
        timers.push(setTimeout(function () { if (!stale(my)) stepDone(); }, 700));
      }
    }

    function cele(o) {
      var el = $('cele');
      el.innerHTML = '<div class="box" role="dialog" aria-live="assertive"><div class="face">' + TICK + '</div><h3>' + o.title + '</h3><p>' + o.msg + '</p><div class="btns">' + o.btns + '</div></div>';
      el.hidden = false;
      el.querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () { o.on[b.dataset.a](); }; });
      var first = el.querySelector('button'); if (first) first.focus();
    }
    function stepDone() {
      S.markDone(os, mi, curSi); dots();
      var last = curSi + 1 >= mod.steps.length;
      if (!last) {
        cele({ title: pick(PRAISE), msg: step.ok || '', btns: '<button class="btn good" data-a="next">Continuar ▶</button>', on: { next: function () { startStep(curSi + 1); } } });
      } else {
        var hasNext = !!L[mi];
        cele({
          title: 'Módulo terminado', msg: (step.ok || '') + '<br><br>Has terminado <b>' + mod.title + '</b>.',
          btns: (hasNext ? '<button class="btn good" data-a="nm">Siguiente módulo ▶</button>' : '') + '<button class="btn alt" data-a="menu">Volver al menú</button>',
          on: { nm: function () { go('#/m/' + (mi + 1) + '/0'); }, menu: function () { go('#/menu'); } }
        });
      }
    }

    $('bShow').onclick = function () {
      if (done || !task) return;
      if (task.type && task.type.demo) { var my = tok; kb.cancelDemo(); demoing = false; runDemo(my); }
      else if (task.show) { fb('Mira cómo se hace…'); task.show(phone); }
    };
    $('bHint').onclick = function () { showHint(false); };
    $('bUp').onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    $('bRepeat').onclick = function () { startStep(curSi); };
    $('bMenu').onclick = function () { go('#/menu'); };
    $('bSkip').onclick = function () { if (curSi + 1 < mod.steps.length) startStep(curSi + 1); else go('#/menu'); };

    AM.current = { phone: phone, task: function () { return task; }, ti: function () { return ti; }, si: function () { return curSi; }, step: function () { return step; }, demoing: function () { return demoing; }, done: function () { return done; } };
    runner = {
      fit: fit,
      destroy: function () {
        dead = true; tok++; clearTimeout(idleT); clearTimeout(fbT); timers.forEach(clearTimeout); kb.cancelDemo();
        window.removeEventListener('resize', fit); window.removeEventListener('scroll', onScroll); if (ro) ro.disconnect(); phone.destroy();
      }
    };
    startStep(si);
  }

  /* ---------- rutas ---------- */
  function render() {
    if (runner) { runner.destroy(); runner = null; }
    var st = S.get(), h = location.hash || '#/';
    document.documentElement.style.setProperty('--fs', st.fs + 'px');
    if (h === '#/elegir' || !st.os) { welcome(false); return; }
    var m = h.match(/^#\/m\/(\d+)\/(\d+)$/);
    if (m) { lesson(+m[1], +m[2]); return; }
    menu();
  }
  window.addEventListener('hashchange', render);
  setupHeader();
  render();
})();
