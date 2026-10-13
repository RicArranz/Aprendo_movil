/* Móvil simulado: núcleo (pantalla, estado, campos de texto, teclado, panel de arriba).
   Las apps/inicio/recientes están en apps.js, copiar-pegar en clip.js y el editor del panel en edit.js. */
(function () {
  'use strict';
  var AM = window.AM = window.AM || {};
  var sleep = AM.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  AM.wait = function (ms) { return sleep(ms * (AM.slow == null ? 1 : AM.slow)); };
  var esc = AM.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- iconos ---------- */
  var svg = AM.svg = function (d, sz) { sz = sz || 24; return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" fill="currentColor" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var svgS = AM.svgS = function (inner, sz, w) { sz = sz || 24; return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" fill="none" stroke="currentColor" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; };
  var IC = AM.IC = {
    wifi: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z',
    bt: 'M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z',
    air: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
    batt: 'M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z',
    loc: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    rot: 'M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z',
    dnd: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7 13v-2h10v2H7z',
    torch: 'M8 2h8v3l-2 3v12a2 2 0 01-2 2h0a2 2 0 01-2-2V8L8 5V2zm4 6a1.4 1.4 0 100 2.8A1.4 1.4 0 0012 8z',
    data: 'M2 22h20V2z',
    moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
    send: 'M2 21l21-9L2 3v7l15 2-15 2z',
    mic: 'M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z',
    backspace: 'M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z',
    shift: 'M12 4l-8 9h5v7h6v-7h5z',
    enter: 'M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    arrow: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
    back: 'M17 4v16L5 12z'
  };
  var IS = AM.IS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7"/>',
    lockrot: '<rect x="6" y="10" width="12" height="9" rx="2"/><path d="M9 10V8a3 3 0 016 0v2"/>',
    mirror: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/>',
    cam: '<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
    emoji: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 007 0"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="3"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    recents: '<rect x="5" y="5" width="14" height="14" rx="3"/>',
    home: '<circle cx="12" cy="12" r="7"/>',
    shot: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 8V5a2 2 0 012-2M21 8V5a2 2 0 00-2-2M3 16v3a2 2 0 002 2M21 16v3a2 2 0 01-2 2"/>',
    nfc: '<path d="M9 7c3 3 3 7 0 10M13 5c4 4.5 4 9.5 0 14M17 3c5 6 5 12 0 18"/><circle cx="5.5" cy="12" r="1" fill="currentColor"/>',
    hotspot: '<path d="M5 12.5a7 7 0 0114 0M8 12.5a4 4 0 018 0"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/><path d="M12 14v6"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
    rec: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
    zoom: '<circle cx="10" cy="10" r="6"/><path d="M20 20l-5.5-5.5M8 10h4M10 8v4"/>',
    minus: '<path d="M6 12h12"/>',
    chevl: '<path d="M15 5l-7 7 7 7"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01" stroke-width="2.4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>'
  };

  var DEFAULT_STATE = { wifi: true, bt: false, air: false, torch: false, dnd: false, rot: true, saver: false, loc: true, data: true, nfc: false, hotspot: false, bright: 70, vol: 50, orient: false, focus: false };

  /* ---------- apps ---------- */
  var APPS = AM.APPS = {
    telefono: ['Teléfono', '📞', '#2e7d32'], whatsapp: ['WhatsApp', '💬', '#128c7e'], mensajes: ['Mensajes', '💬', '#34c759'],
    camara: ['Cámara', '📷', '#4b5563'], fotos: ['Fotos', '🌄', '#f59e0b'], chrome: ['Chrome', '🌐', '#4285f4'], safari: ['Safari', '🧭', '#0a84ff'],
    ajustes: ['Ajustes', '⚙️', '#6b7280'], notas: ['Notas', '📝', '#facc15'], correo: ['Correo', '✉️', '#ef4444'],
    reloj: ['Reloj', '⏰', '#1f2937'], mapas: ['Mapas', '🗺️', '#16a34a'], youtube: ['YouTube', '▶️', '#dc2626'], calc: ['Calculadora', '🧮', '#374151'],
    solitario: ['Solitario', '🃏', '#0f766e'], radio: ['Radio', '📻', '#7c3aed'], tiempo: ['El tiempo', '⛅', '#0ea5e9']
  };
  /* escena que enseña cada app (el resto abre una pantalla de práctica) */
  AM.APP_SCENE = {
    android: { chrome: 'browser', whatsapp: 'chat', fotos: 'gallery', ajustes: 'settings', notas: 'notes', correo: 'mail' },
    ios: { safari: 'browser', mensajes: 'chat', fotos: 'gallery', ajustes: 'settings', notas: 'notes', correo: 'mail' }
  };
  /* app a la que pertenece cada escena */
  AM.SCENE_APP = {
    android: { browser: 'chrome', form: 'chrome', web: 'chrome', chat: 'whatsapp', gallery: 'fotos', settings: 'ajustes', subpage: 'ajustes', notes: 'notas', mail: 'correo' },
    ios: { browser: 'safari', form: 'safari', web: 'safari', chat: 'mensajes', gallery: 'fotos', settings: 'ajustes', subpage: 'ajustes', ccsettings: 'ajustes', notes: 'notas', mail: 'correo' }
  };

  /* ---------- pantallas (escenas) ---------- */
  /* texto seleccionable: se convierte en palabras sueltas (ver clip.js) */
  function sel(text, tag, cls) { return '<' + (tag || 'span') + ' class="seltxt ' + (cls || '') + '" data-text="' + esc(text) + '"></' + (tag || 'span') + '>'; }
  var PHOTOS = [['#f9a8d4', '🌸'], ['#a5b4fc', '🏖️'], ['#86efac', '🌳'], ['#fde68a', '🐶'], ['#fdba74', '🎂'], ['#93c5fd', '⛵'], ['#c4b5fd', '👪'], ['#fca5a5', '🍓'], ['#99f6e4', '🏞️']];
  var SCENES = AM.SCENES = {
    browser: function (p) {
      if (p.ios) {
        return '<div class="sc browser blankzone"><div class="sf-fav-t blankzone">Favoritos</div>' +
          '<div class="shortcuts blankzone">' + shortcuts() + '</div>' +
          '<div class="sf-bar">' + p.field('q', { type: 'search', enter: 'search', ph: 'Buscar o introducir sitio web', cap: false }) + '</div></div>';
      }
      return '<div class="sc browser blankzone"><div class="ch-bar"><span>⌂</span><span class="url">Buscar o escribir URL</span><span>⋮</span></div>' +
        '<div class="gl"><i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i></div>' +
        '<div class="sbox">' + p.field('q', { type: 'search', enter: 'search', ph: 'Buscar en Google', ic: svgS(IS.search, 22), cls: 'pill', cap: false }) + '</div>' +
        '<div class="shortcuts blankzone">' + shortcuts() + '</div></div>';
    },
    web: function (p, cfg) {
      var bar = p.ios ? '<div class="sf-bar"><div class="url-ios">🔒 mipueblo.es</div></div>' : '<div class="ch-bar"><span>←</span><span class="url">🔒 mipueblo.es</span><span>⋮</span></div>';
      var body = '<div class="web blankzone"><h3>Mi pueblo</h3><div class="pic" data-img="pueblo" data-emoji="🏞️" data-color="#bde0fe">🏞️</div>' +
        sel(cfg.text || 'Visita el Ayuntamiento en Calle Real 25, Toledo. Teléfono: 600 111 222.', 'p') + '</div>';
      return p.ios ? '<div class="sc webp">' + body + bar + '</div>' : '<div class="sc webp">' + bar + body + '</div>';
    },
    chat: function (p, cfg) {
      var head = p.ios
        ? '<div class="cht-head"><div class="av">👩</div><b>Marta</b></div>'
        : '<div class="cht-head"><span>‹</span><div class="av">👩</div><div><b>Marta (hija)</b><small>en línea</small></div></div>';
      var msgs = (cfg.msgs || ['Hola, ¿cómo estás? 😊']).map(function (m) { return '<div class="bub">' + sel(m) + '</div>'; }).join('');
      return '<div class="sc chat">' + head +
        '<div class="msgs blankzone">' + msgs + '</div><div class="cht-att" hidden></div>' +
        '<div class="cht-in"><div class="plusb">+</div>' + p.field('msg', { type: 'text', enter: 'newline', multi: true, ph: p.ios ? 'iMessage' : 'Mensaje' }) +
        '<div class="sendb mute" data-tap="send">' + svg(IC.mic, 22) + '</div></div></div>';
    },
    form: function (p, cfg) {
      var only = cfg.only, h = '<div class="sc form"><div class="pg-head">Taller de móvil</div>';
      var show = function (id) { return !only || only.indexOf(id) >= 0; };
      h += '<p class="blankzone">' + (cfg.intro || (only ? 'Escribe tu teléfono para que te avisemos.' : 'Apúntate al taller. Rellena los cuadros de abajo.')) + '</p>';
      if (show('name')) h += '<label>Nombre</label>' + p.field('name', { type: 'text', enter: 'next', next: 'tel', ph: 'Nombre' });
      if (show('tel')) h += '<label>Teléfono</label>' + p.field('tel', { type: 'tel', enter: 'done', ph: 'Teléfono' });
      if (show('mail')) h += '<label>Correo electrónico</label>' + p.field('mail', { type: 'email', enter: 'done', ph: 'Correo electrónico', cap: false });
      if (cfg.long) {
        h += '<p class="blankzone">Este taller dura cuatro semanas. Cada día aprenderás una cosa nueva con tu móvil.</p>' +
          '<p class="blankzone">Primero veremos cómo escribir. Luego, cómo hacer fotos y mandarlas a la familia.</p>' +
          '<p class="blankzone">No hace falta saber nada. Venimos a aprender, sin prisa y sin miedo.</p>' +
          '<p class="blankzone">Puedes traer a un familiar si quieres. Habrá café para todos.</p>';
      }
      if (show('comment')) h += '<label>Comentario</label>' + p.field('comment', { type: 'text', area: true, enter: 'newline', ph: 'Escribe aquí tu comentario' });
      if (show('comment')) h += '<div class="btn-sub" data-tap="submit">Enviar</div>';
      return h + '</div>';
    },
    gallery: function () {
      return '<div class="sc"><div class="gal-head"><h4>Fotos</h4><div class="rv" data-reveal="search" aria-label="Buscar">' + svgS(IS.search, 26) + '</div></div>' +
        '<div class="photos blankzone">' + PHOTOS.map(function (c, i) { return '<i class="ph" data-img="f' + i + '" data-emoji="' + c[1] + '" data-color="' + c[0] + '" style="background:' + c[0] + '">' + c[1] + '</i>'; }).join('') + '</div></div>';
    },
    settings: function (p) {
      var rows = [['📶', 'Wi-Fi', 'wifi internet red conexion'], ['🔵', 'Bluetooth', 'bluetooth auriculares altavoz'], ['🔊', 'Sonido', 'sonido volumen timbre tono'], ['🔆', 'Pantalla', 'pantalla brillo luz letra tamaño fondo'], ['🔋', 'Batería', 'bateria energia carga ahorro'], ['📍', 'Ubicación', 'ubicacion gps mapa localizacion']];
      if (p.ios) rows.push(['🎛️', 'Centro de control', 'centro de control botones']);
      return '<div class="sc sett"><div class="sett-h blankzone">Ajustes</div><div class="sbar">' +
        p.field('q', { type: 'search', enter: 'search', ph: p.ios ? 'Buscar' : 'Buscar en Ajustes', ic: svgS(IS.search, 20), cap: false }) + '</div>' +
        '<div class="list blankzone">' + rows.map(function (r) { return '<div class="row" data-k="' + r[2] + '" data-go="' + (r[1] === 'Centro de control' ? 'ccsettings' : 'subpage') + '" data-title="' + r[1] + '"><i>' + r[0] + '</i>' + r[1] + '<em>›</em></div>'; }).join('') + '<div class="row none" hidden>No hay resultados. Prueba con otra palabra.</div></div></div>';
    },
    subpage: function (p, cfg) {
      var t = cfg.title || 'Pantalla';
      var head = p.ios ? '<div class="nav-h"><span class="bk" data-back>‹ Ajustes</span><b>' + esc(t) + '</b><span></span></div>'
        : '<div class="nav-h"><span class="bk" data-back>' + svgS(IS.chevl, 24) + '</span><b>' + esc(t) + '</b></div>';
      return '<div class="sc sett">' + head + '<div class="list blankzone" style="margin-top:14px"><div class="row">Opción 1<em></em></div><div class="row">Opción 2<em></em></div><div class="row">Opción 3<em></em></div></div></div>';
    },
    dummy: function (p, cfg) {
      var a = APPS[cfg.app] || ['App', '📱', '#999'];
      return '<div class="sc dummy blankzone"><div class="dm-ic" style="background:' + a[2] + '">' + a[1] + '</div><h3>' + a[0] + '</h3><p>Esta aplicación es de práctica: aquí no hay nada que hacer.</p></div>';
    },
    notes: function (p, cfg) {
      return '<div class="sc notes"><div class="nt-head blankzone">' + (p.ios ? '‹ Notas' : 'Nueva nota') + '</div>' +
        p.field('note', { type: 'text', area: true, enter: 'newline', ph: 'Toca aquí para escribir', value: cfg.value || '' }) + '</div>';
    },
    mail: function (p, cfg) {
      return '<div class="sc mail"><div class="ml-head blankzone"><b>Mensaje nuevo</b><span style="color:#1b6ef3">' + svg(IC.send, 22) + '</span></div>' +
        '<div class="ml-row"><span>Para</span>' + p.field('to', { type: 'email', enter: 'next', next: 'subject', ph: '', cap: false }) + '</div>' +
        '<div class="ml-row"><span>Asunto</span>' + p.field('subject', { type: 'text', enter: 'next', next: 'body', ph: '' }) + '</div>' +
        '<div class="ml-body">' + p.field('body', { type: 'text', area: true, enter: 'newline', ph: 'Escribe tu mensaje', value: cfg.value || '' }) + '</div></div>';
    }
  };
  function shortcuts() {
    return [['📰', 'Noticias'], ['🌦️', 'Tiempo'], ['🍳', 'Recetas'], ['📺', 'Tele']].map(function (a) { return '<div><b>' + a[0] + '</b>' + a[1] + '</div>'; }).join('');
  }

  /* ---------- iconos del panel (Android) ---------- */
  var TILES = AM.TILES = {
    wifi: [svg(IC.wifi, 22), 'Wi-Fi', 'Casa_Wifi', 'Desactivado'], bt: [svg(IC.bt, 22), 'Bluetooth', 'Activado', 'Desactivado'],
    torch: [svg(IC.torch, 22), 'Linterna', 'Activada', 'Desactivada'], rot: [svg(IC.rot, 22), 'Girar pantalla', 'Activado', 'Desactivado'],
    air: [svg(IC.air, 22), 'Modo avión', 'Activado', 'Desactivado'], dnd: [svg(IC.dnd, 22), 'No molestar', 'Activado', 'Desactivado'],
    saver: [svg(IC.batt, 22), 'Ahorro de batería', 'Activado', 'Desactivado'], loc: [svg(IC.loc, 22), 'Ubicación', 'Activada', 'Desactivada'],
    data: [svg(IC.data, 20), 'Datos móviles', 'Activados', 'Desactivados'], nfc: [svgS(IS.nfc, 22), 'NFC', 'Activado', 'Desactivado'],
    hotspot: [svgS(IS.hotspot, 22), 'Punto de acceso', 'Activado', 'Desactivado'],
    captura: [svgS(IS.shot, 22), 'Captura de pantalla', '', '', true], qr: [svgS(IS.qr, 22), 'Escáner QR', '', '', true]
  };
  var DEFAULT_QS = ['wifi', 'bt', 'torch', 'rot', 'air', 'dnd', 'saver', 'loc'];
  var CC_ITEMS = AM.CC_ITEMS = {
    torch: [svg(IC.torch, 26), 'Linterna'], timer: [svgS(IS.timer, 26), 'Temporizador'], calc: [svgS(IS.calc, 26), 'Calculadora'], cam: [svgS(IS.cam, 26), 'Cámara'],
    grab: [svgS(IS.rec, 26), 'Grabación de pantalla'], nfc: [svgS(IS.nfc, 26), 'Lector de códigos NFC'], lupa: [svgS(IS.zoom, 26), 'Lupa']
  };
  var DEFAULT_CC = ['torch', 'timer', 'calc', 'cam'];

  /* ---------- Phone ---------- */
  function Phone(host, os, opt) {
    opt = opt || {};
    this.host = host; this.os = os; this.ios = os === 'ios'; this.btn = this.ios && opt.iosHome === 'button';
    this.s = Object.assign({}, DEFAULT_STATE);
    this.vals = {}; this.fcfg = {}; this.fid = null; this.fg = 'app'; this.scene = null; this.sceneCfg = {}; this.panel = null;
    this.ls = []; this.scale = 1; this.dead = false; this._pre = null; this._timers = [];
    this.navMode = 'buttons'; this.freeApps = false; this.clip = null;
    this.qsList = DEFAULT_QS.slice(); this.ccList = DEFAULT_CC.slice();
    this.initApps();
    this.build();
  }
  var P = Phone.prototype;
  P.q = function (s) { return this.root.querySelector(s); };
  P.on = function (fn) { this.ls.push(fn); };
  P.off = function (fn) { this.ls = this.ls.filter(function (f) { return f !== fn; }); };
  P.emit = function (type, d) { var ev = Object.assign({ type: type }, d || {}); var self = this; this.ls.slice().forEach(function (f) { f(ev, self); }); };

  P.build = function () {
    this.host.innerHTML = '<div class="phone ' + this.os + (this.btn ? ' hasbtn' : '') + '">' +
      '<div class="p-body">' +
      '<div class="p-island"></div>' +
      '<div class="p-status"><span class="st-time"></span><span class="st-ic"></span></div>' +
      '<div class="p-screen"><div class="p-app"></div><div class="p-home hidden"></div><div class="p-recents"></div><div class="p-dim"></div><div class="p-panel"></div><div class="p-layer"></div><div class="p-toast"></div></div>' +
      '<div class="p-kbd"></div><div class="p-nav"></div><div class="p-edges"></div><div class="p-finger">👆</div></div>' +
      (this.btn ? '<div class="p-hw" data-nav="home" role="button" aria-label="Botón de inicio"></div>' : '') + '</div>';
    this.root = this.host.firstChild;
    this.buildNav();
    this.kb = new AM.Keyboard(this);
    this.bind();
    this.updateStatus();
    this.setBright(this.s.bright, true);
    var self = this;
    this._clock = setInterval(function () { self.updateStatus(); }, 20000);
  };

  P.destroy = function () {
    this.dead = true; clearInterval(this._clock);
    if (this.kb && this.kb._ku) window.removeEventListener('pointerup', this.kb._ku);
    window.removeEventListener('pointermove', this._dm); window.removeEventListener('pointerup', this._du);
    if (this.unbindNav) this.unbindNav();
    this._timers.forEach(clearTimeout); this.ls = [];
  };

  P.bind = function () {
    var self = this, app = this.q('.p-app');
    /* toques dentro de la app */
    app.addEventListener('click', function (e) {
      var f = e.target.closest('.field'), rv = e.target.closest('[data-reveal]'), tp = e.target.closest('[data-tap]'), go = e.target.closest('[data-go]'), bk = e.target.closest('[data-back]');
      if (self.sel && !f) { self.clearSel(); }
      if (f) { self.focus(f.dataset.fid); return; }
      if (rv) { self.reveal(rv.dataset.reveal); return; }
      if (tp) { self.emit('tap', { id: tp.dataset.tap }); if (tp.dataset.tap === 'send') self.sendMsg(); else if (tp.dataset.tap === 'attach-x') self.clearAttach(); return; }
      if (go) { self.openIn(go.dataset.go, { title: go.dataset.title }); self.emit('go', { to: go.dataset.go, title: go.dataset.title }); return; }
      if (bk) { self.back(); return; }
      if (self.ios && self.fid) { self.hideKb(); return; }
      self.emit('miss', { target: e.target });
    });
    /* con ratón, arrastrar la pantalla la desplaza (el dedo ya lo hace solo) */
    app.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('.grip')) return;
      self._ds = { y: e.clientY, top: app.scrollTop, moved: false };
    });
    window.addEventListener('pointermove', this._dm = function (e) {
      var d = self._ds; if (!d) return;
      var dy = e.clientY - d.y;
      if (Math.abs(dy) > 6) d.moved = true;
      if (d.moved) app.scrollTop = d.top - dy / self.scale;
    });
    window.addEventListener('pointerup', this._du = function () { var d = self._ds; self._ds = null; if (d && d.moved) self._noClick = Date.now(); });
    this.root.addEventListener('click', function (e) { if (self._noClick && Date.now() - self._noClick < 120) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    this.root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    this.bindNav(); this.bindHome(); this.bindClip(); this.bindEdit();
    /* panel */
    this.q('.p-panel').addEventListener('click', function (e) {
      var t = e.target.closest('[data-tile]');
      if (t && !self.panel.edit) { self.tapTile(t.dataset.tile); return; }
      if (e.target.closest('[data-static]') && !(self.panel && self.panel.edit)) { self.toast('Este botón no lo necesitas hoy. ¡Lo dejamos para otro día!'); return; }
      if (e.target.closest('[data-slider]')) return;
      if (self.panelClick && self.panelClick(e)) return;
      if (self.panel && self.panel.edit) return;
      if (e.target.classList.contains('cc-bg') || e.target.classList.contains('cc-tip') || e.target.classList.contains('qs-handle') || e.target.classList.contains('nf-bg')) self.closePanel();
    });
  };

  P.swipeTop = function (kind) {
    if (this.fg !== 'app' && this.fg !== 'home') return;
    var pn = this.panel;
    if (kind === 'qs') {
      if (!pn) this.openPanel('qs', 1);
      else if (pn.kind === 'qs' && pn.stage === 1) this.openPanel('qs', 2);
    } else if (!pn) this.openPanel(kind, 1);
  };

  /* ---------- campos de texto ---------- */
  P.field = function (id, cfg) {
    cfg = Object.assign({ type: 'text', ph: '', enter: 'newline', cap: true }, cfg || {});
    this.fcfg[id] = cfg;
    if (!(id in this.vals)) this.vals[id] = cfg.value || '';
    return '<div class="field' + (cfg.area ? ' area' : '') + (cfg.ic ? ' has-ic' : '') + (cfg.cls ? ' ' + cfg.cls : '') + '" data-fid="' + id + '" role="textbox" aria-label="' + esc(cfg.ph || id) + '">' +
      (cfg.ic ? '<span class="f-ic">' + cfg.ic + '</span>' : '') + '<span class="f-txt"></span><i class="f-caret"></i><span class="f-ph">' + esc(cfg.ph) + '</span></div>';
  };
  /* palabras sueltas para poder seleccionarlas con el dedo (clip.js) */
  P.tokens = function (el, text) {
    var h = '', re = /\S+/g, m, last = 0, i = 0;
    while ((m = re.exec(text))) {
      h += esc(text.slice(last, m.index)) + '<span class="w" data-i="' + i + '" data-s="' + m.index + '" data-e="' + (m.index + m[0].length) + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length; i++;
    }
    el.innerHTML = h + esc(text.slice(last));
  };
  P.refreshFields = function () {
    var self = this;
    this.root.querySelectorAll('.field[data-fid]').forEach(function (el) {
      var id = el.dataset.fid, v = self.vals[id] || '', t = el.querySelector('.f-txt');
      if (t.dataset.v !== v) { self.tokens(t, v); t.dataset.v = v; }
      el.classList.toggle('has', v.length > 0);
      el.classList.toggle('focus', self.fid === id);
    });
  };
  P.setValue = function (id, v) {
    this.vals[id] = v; this.refreshFields();
    if (this.sel && this.sel.fid === id) this.clearSel();
    if (id === 'msg') this.updateSend();
    var el = this.root.querySelector('.field[data-fid="' + id + '"]');
    if (el && el.closest('.msgs, .cht-in')) { var m = this.q('.msgs'); if (m) m.scrollTop = m.scrollHeight; }
  };
  P.getValue = function (id) { return this.vals[id] || ''; };
  P.updateSend = function () {
    var b = this.q('.sendb'); if (!b) return;
    var has = (this.vals.msg || '').trim().length > 0 || !!this.attach;
    b.innerHTML = svg(has ? IC.send : IC.mic, 22);
    b.classList.toggle('mute', this.ios && !has);
  };
  P.sendMsg = function () {
    var v = (this.vals.msg || '').trim(), att = this.attach;
    if (!v && !att) { this.toast('Primero escribe algo en el cuadro.'); return; }
    var m = this.q('.msgs');
    if (att) { var im = document.createElement('div'); im.className = 'bub me imgb'; im.style.background = att.color; im.textContent = att.emoji; m.appendChild(im); }
    if (v) { var d = document.createElement('div'); d.className = 'bub me'; d.textContent = v; m.appendChild(d); }
    this.setValue('msg', ''); this.clearAttach(true);
    if (this.fid) this.kb.autoShift(true), this.kb.render();
    m.scrollTop = m.scrollHeight;
    this.emit('send', { text: v, image: !!att });
  };
  P.reveal = function (id) {
    var head = this.q('.gal-head'); if (!head) return;
    head.innerHTML = this.field(id, { type: 'search', enter: 'search', ph: 'Buscar en tus fotos', ic: svgS(IS.search, 20), cap: false, cls: 'pill' });
    this.refreshFields(); this.focus(id);
  };

  /* ---------- teclado ---------- */
  P.focus = function (id) {
    var cfg = this.fcfg[id];
    if (!cfg || this.panel) return;
    if (!(this.fg === 'app' || (this.fg === 'home' && cfg.home))) return;
    var was = this.fid; this.fid = id;
    this.refreshFields(); this.kb.open(id, cfg);
    this.root.classList.add('kb-open');
    this.scrollToField(id);
    this.emit('focus', { id: id, ftype: cfg.type, was: was });
    if (!was) this.emit('kbd', { open: true });
  };
  P.scrollToField = function (id) {
    var self = this;
    setTimeout(function () {
      if (self.dead) return;
      var app = self.q('.p-app'), el = self.root.querySelector('.field[data-fid="' + id + '"]'); if (!el || !app.contains(el)) return;
      var a = app.getBoundingClientRect(), r = el.getBoundingClientRect(), sc = self.scale || 1;
      if (r.top < a.top + 6 || r.bottom > a.bottom - 6) app.scrollTop += (r.top + r.height / 2 - (a.top + a.height / 2)) / sc;
    }, 40);
  };
  P.hideKb = function () {
    if (!this.fid) return;
    this.closeKb(); this.emit('kbd', { open: false });
  };
  P.closeKb = function () {
    this.fid = null; if (this.kb) this.kb.close(); this.root.classList.remove('kb-open'); this.refreshFields();
  };

  /* ---------- estado: Wi-Fi, linterna, brillo… ---------- */
  P.set = function (patch) { Object.assign(this.s, patch); this.updateStatus(); this.setBright(this.s.bright, true); if (this.panel) this.renderPanel(); };
  P.resetState = function () {
    this.closePanel(true); this.hideKb(); this.set(Object.assign({}, DEFAULT_STATE)); this._pre = null;
    this.qsList = DEFAULT_QS.slice(); this.ccList = DEFAULT_CC.slice(); this.clip = null; this.freeApps = false; this.glow = null;
    this.resetApps();
  };
  P.toggle = function (name, val) {
    var cur = !!this.s[name], next = val === undefined ? !cur : !!val;
    if (next === cur) return;
    if (name === 'air') {
      if (next) { this._pre = { wifi: this.s.wifi, bt: this.s.bt }; this.s.wifi = false; this.s.bt = false; }
      else if (this._pre) { this.s.wifi = this._pre.wifi; this.s.bt = this._pre.bt; }
    }
    this.s[name] = next;
    this.updateStatus(); if (this.panel) this.renderPanel();
    this.emit('toggle', { name: name, on: next });
  };
  /* tocar un icono del panel: enciende/apaga, o hace una acción (captura, escáner…) */
  P.tapTile = function (id) {
    var t = TILES[id];
    if (t && t[4]) { this.toast(id === 'captura' ? '📸 ¡Captura hecha! La verás en Fotos.' : 'Se abriría el escáner de códigos QR.'); this.emit('tileAction', { name: id }); return; }
    this.toggle(id);
  };
  P.setBright = function (v, silent) {
    this.s.bright = v;
    var f = v <= 70 ? .3 + .7 * (v / 70) : 1 + (v - 70) / 30 * .45;   /* 0 → muy oscuro · 70 → normal · 100 → muy claro */
    this.q('.p-body').style.filter = Math.abs(f - 1) < .01 ? '' : 'brightness(' + f.toFixed(2) + ')';
    this.root.querySelectorAll('[data-slider="bright"] i').forEach(function (i) { i.style[i.parentNode.classList.contains('cc-sl') ? 'height' : 'width'] = v + '%'; });
    if (!silent) this.emit('slider', { name: 'bright', value: v });
  };
  P.updateStatus = function () {
    var s = this.s, d = new Date(), z = function (n) { return ('0' + n).slice(-2); };
    this.q('.st-time').textContent = d.getHours() + ':' + z(d.getMinutes());
    var ic = '';
    if (s.torch) ic += svg(IC.torch, 14);
    if (s.dnd && this.os === 'android') ic += svg(IC.dnd, 14);
    if (s.bt) ic += svg(IC.bt, 14);
    if (s.air) ic += svg(IC.air, 14);
    if (s.wifi) ic += svg(IC.wifi, 15);
    if (!s.air && s.data) ic += svg(IC.data, 12);
    ic += '<span class="bat">' + (this.ios ? '' : '87%') + '<i></i></span>';
    this.q('.st-ic').innerHTML = ic;
    this.root.classList.toggle('torch', !!s.torch);
  };

  /* ---------- panel de arriba (Android) / centro de control (iPhone) ---------- */
  P.openPanel = function (kind, stage, silent) {
    this.hideKb(); this.closeLayer(); this.panel = { kind: kind, stage: stage };
    var el = this.q('.p-panel'); this.root.classList.add('panel-open');
    if (silent) el.style.transition = 'none';
    this.renderPanel(); el.classList.add('open');
    if (silent) { void el.offsetWidth; el.style.transition = ''; }
    if (!silent) this.emit('panel', { kind: kind, stage: stage });
  };
  P.closePanel = function (silent) {
    if (!this.panel) return;
    this.panel = null; this.q('.p-panel').classList.remove('open'); this.root.classList.remove('panel-open');
    if (!silent) this.emit('panel', { kind: null, stage: 0 });
  };
  P.renderPanel = function () {
    var pn = this.panel, el = this.q('.p-panel'), s = this.s, self = this, h = '';
    if (!pn) return;
    if (pn.kind === 'qs' && pn.edit) { this.renderQsEdit(); return; }
    if (pn.kind === 'qs') {
      var ids = pn.stage === 1 ? this.qsList.slice(0, 4) : this.qsList;
      var d = new Date(), dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      h = '<div class="qs' + (pn.stage === 2 ? ' full' : '') + '"><div class="qs-head"><span class="qs-time">' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2) + '</span><span class="qs-date">' + dias[d.getDay()] + ', ' + d.getDate() + ' ' + mes[d.getMonth()] + '</span></div>' +
        '<div class="qs-tiles">' + ids.map(function (id) {
          var t = TILES[id], on = !t[4] && !!s[id];
          return '<div class="tile' + (on ? ' on' : '') + '" data-tile="' + id + '" role="button" aria-pressed="' + on + '"><span class="ti">' + t[0] + '</span><span class="tl"><b>' + t[1] + '</b>' + (t[4] ? '' : '<small>' + (on ? t[2] : t[3]) + '</small>') + '</span></div>';
        }).join('') + '</div>' +
        '<div class="qs-bright">' + svgS(IS.sun, 24) + '<div class="slider" data-slider="bright"><i></i></div></div>' +
        (pn.stage === 1
          ? '<div class="qs-notifs"><div class="notif"><b>WhatsApp · Marta</b>Hola abuelo, ¿cómo estás? 😊</div><div class="notif"><b>Tiempo</b>Hoy: soleado, 22°</div></div><div class="qs-tip">Desliza otra vez desde arriba para ver más iconos</div>'
          : '<div class="qs-foot"><span class="qs-pencil" data-qs="edit" role="button" aria-label="Editar iconos">' + svgS(IS.pencil, 22) + '</span><span class="qs-tip">Los iconos en azul están encendidos.</span></div>') +
        '<div class="qs-handle"></div></div>';
    } else if (pn.kind === 'cc') {
      var b = function (id, ic, cls) { return '<div class="cc-c ' + cls + (s[id] ? ' on' : '') + '" data-tile="' + id + '" role="button" aria-pressed="' + !!s[id] + '">' + ic + '</div>'; };
      var edit = !!pn.edit;
      var low = this.ccList.map(function (id) {
        var it = CC_ITEMS[id], bdg = edit ? '<i class="bdg" data-ccrm2="' + id + '" role="button" aria-label="Quitar">−</i>' : '';
        if (edit) return '<div class="cc-b' + (id === 'torch' && s.torch ? ' on' : '') + '" data-ccid="' + id + '" aria-label="' + it[1] + '">' + it[0] + bdg + '</div>';
        if (id === 'torch') return '<div class="cc-b cc-torch' + (s.torch ? ' on' : '') + '" data-tile="torch" role="button" aria-pressed="' + !!s.torch + '">' + it[0] + '</div>';
        return '<div class="cc-b" data-static="1" aria-label="' + it[1] + '">' + it[0] + '</div>';
      }).join('');
      h = '<div class="cc-bg' + (edit ? ' editing' : '') + '">' + (edit ? '<div class="cc-ok" data-ccedit="done" role="button">OK</div>' : '<div class="cc-plus" data-ccedit="open" role="button" aria-label="Editar controles">+</div>') + '<div class="cc-grid">' +
        '<div class="cc-conn">' + b('air', svg(IC.air, 24), 'air') + b('data', svg(IC.data, 20), 'data') + b('wifi', svg(IC.wifi, 24), 'wifi') + b('bt', svg(IC.bt, 24), 'bt') + '</div>' +
        '<div class="cc-b cc-media" data-static="1"><b>No se está reproduciendo nada</b><span>♪</span></div>' +
        '<div class="cc-b cc-orient' + (s.orient ? ' on' : '') + '" data-tile="orient">' + svgS(IS.lockrot, 26) + '</div>' +
        '<div class="cc-b" data-static="1">' + svgS(IS.mirror, 26) + '</div>' +
        '<div class="cc-b cc-sl" data-slider="bright" style="grid-column:3"><i></i><span>' + svgS(IS.sun, 22) + '</span></div>' +
        '<div class="cc-b cc-sl" data-slider="vol" style="grid-column:4"><i style="height:' + s.vol + '%"></i><span>' + svgS(IS.speaker, 22) + '</span></div>' +
        '<div class="cc-b cc-focus' + (s.focus ? ' on' : '') + '" data-tile="focus">' + svg(IC.moon, 22) + 'Concentración</div>' +
        low + '</div>' + (edit ? '<div class="cc-addbar" data-ccedit="gallery" role="button">＋ Añadir un control</div>' : '<div class="cc-tip">Desliza hacia ' + (this.btn ? 'abajo' : 'arriba') + ' o toca la parte oscura para cerrar</div>') +
        (edit && pn.gallery ? this.ccGalleryHtml() : '') + '</div>';
    } else {
      h = '<div class="nf-bg"><h5>Notificaciones</h5><div class="notif"><b>Mensajes · Marta</b>Hola abuelo, ¿cómo estás? 😊</div><div class="notif"><b>Tiempo</b>Hoy: soleado, 22°</div>' +
        '<div class="cc-tip" style="margin-top:auto">Esto son las <b>notificaciones</b>. El centro de control sale ' + (this.btn ? 'desde <b>abajo</b>' : 'desde la esquina de <b>arriba a la derecha</b>') + '.<br>Para cerrar, desliza el dedo hacia arriba.</div></div>';
    }
    el.innerHTML = h;
    el.querySelectorAll('[data-slider]').forEach(function (sl) { self.bindSlider(sl); });
    this.setBright(this.s.bright, true);
  };
  P.bindSlider = function (el) {
    var self = this, name = el.dataset.slider, vert = el.classList.contains('cc-sl'), down = false;
    var set = function (e) {
      var r = el.getBoundingClientRect();
      var v = vert ? 1 - (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
      v = Math.round(Math.max(0, Math.min(1, v)) * 100);
      if (name === 'bright') self.setBright(v);
      else { self.s.vol = v; el.querySelector('i').style.height = v + '%'; self.emit('slider', { name: name, value: v }); }
    };
    el.addEventListener('pointerdown', function (e) { down = true; try { el.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } set(e); });
    el.addEventListener('pointermove', function (e) { if (down) set(e); });
    el.addEventListener('pointerup', function () { down = false; });
    el.addEventListener('pointercancel', function () { down = false; });
  };

  /* ---------- toast, dedo, pistas ---------- */
  P.toast = function (txt) {
    var t = this.q('.p-toast'), self = this; t.textContent = txt; t.classList.add('on');
    clearTimeout(this._tt); this._tt = setTimeout(function () { if (!self.dead) t.classList.remove('on'); }, 3200);
  };
  P.fingerXY = function (x, y) { var f = this.q('.p-finger'); f.style.left = x + 'px'; f.style.top = y + 'px'; };
  P.pointAt = function (el, quick) {
    var f = this.q('.p-finger'), body = this.q('.p-body');
    var b = body.getBoundingClientRect(), r = el.getBoundingClientRect(), sc = this.scale || 1;
    f.style.transitionDuration = '.5s';
    this.fingerXY((r.left + r.width / 2 - b.left) / sc - body.clientLeft, (r.top + r.height * 0.55 - b.top) / sc - body.clientTop);
    f.classList.add('on');
    return AM.wait(quick ? 300 : 620).then(function () { f.classList.add('press'); return AM.wait(170); }).then(function () { f.classList.remove('press'); });
  };
  P.hideFinger = function () { this.q('.p-finger').classList.remove('on', 'press'); };
  /* "Así se hace" un gesto: arrastrar (kind) o mantener pulsado sobre un elemento (kind = 'hold', el) */
  P.demoSwipe = function (kind, el, el2) {
    var self = this, body = this.q('.p-body'), W = body.clientWidth, H = body.clientHeight, f = this.q('.p-finger');
    var a, z, hold = 0;
    if (kind === 'up-app') { a = [W / 2, H * 0.6]; z = [W / 2, H * 0.25]; }
    else if (kind === 'cc-bottom') { a = [W / 2, H - 14]; z = [W / 2, H * 0.4]; }
    else if (kind === 'cc-right') { a = [W - 50, 20]; z = [W - 50, H * 0.4]; }
    else if (kind === 'close-up') { a = [W / 2, H * 0.55]; z = [W / 2, H * 0.12]; }
    else if (kind === 'home-up') { a = [W / 2, H - 12]; z = [W / 2, H * 0.55]; }
    else if (kind === 'recents-up') { a = [W / 2, H - 12]; z = [W / 2, H * 0.55]; hold = 1100; }
    else if (kind === 'edge-back') { a = [6, H * 0.5]; z = [W * 0.45, H * 0.5]; }
    else if (kind === 'bar-right') { a = [W * 0.3, H - 12]; z = [W * 0.8, H - 12]; }
    else if (kind === 'card-up') { var r0 = el.getBoundingClientRect(), b0 = body.getBoundingClientRect(), s0 = this.scale || 1; a = [(r0.left + r0.width / 2 - b0.left) / s0 - body.clientLeft, (r0.top + r0.height * 0.5 - b0.top) / s0 - body.clientTop]; z = [a[0], a[1] - 220]; }
    else if (kind === 'dragto') {
      var rr = el.getBoundingClientRect(), r2 = el2.getBoundingClientRect(), bb = body.getBoundingClientRect(), ss = this.scale || 1;
      a = [(rr.left + rr.width / 2 - bb.left) / ss - body.clientLeft, (rr.top + rr.height * 0.5 - bb.top) / ss - body.clientTop];
      z = [(r2.left + r2.width / 2 - bb.left) / ss - body.clientLeft, (r2.top + r2.height * 0.5 - bb.top) / ss - body.clientTop]; hold = 0;
    } else if (kind === 'drag' || kind === 'hold') {
      var r1 = el.getBoundingClientRect(), b1 = body.getBoundingClientRect(), s1 = this.scale || 1;
      a = [(r1.left + r1.width / 2 - b1.left) / s1 - body.clientLeft, (r1.top + r1.height * 0.5 - b1.top) / s1 - body.clientTop];
      z = kind === 'hold' ? a : [a[0] + 70, a[1] + 110]; hold = kind === 'hold' ? 1500 : 0;
    } else { a = [W / 2, 12]; z = [W / 2, H * 0.45]; }
    f.style.transitionDuration = '0s'; this.fingerXY(a[0], a[1]); f.classList.add('on');
    return sleep(60).then(function () { f.style.transitionDuration = '.2s'; f.classList.add('press'); return sleep(kind === 'hold' || kind === 'drag' || kind === 'dragto' ? 900 : 500); })
      .then(function () { f.style.transitionDuration = '1.1s'; self.fingerXY(z[0], z[1]); return sleep(1300 + hold); })
      .then(function () { f.classList.remove('press'); return sleep(300); })
      .then(function () { self.hideFinger(); });
  };
  P.ring = function (sel, ms) {
    var els = typeof sel === 'string' ? this.root.querySelectorAll(sel) : (sel ? [sel] : []);
    var self = this; this.unring();
    els.forEach(function (e) { e.classList.add('hint-ring'); });
    if (els.length) { var app = this.q('.p-app'); if (app.contains(els[0])) { var a = app.getBoundingClientRect(), r = els[0].getBoundingClientRect(); if (r.top < a.top || r.bottom > a.bottom) app.scrollTop += (r.top - a.top - 40) / (this.scale || 1); } }
    clearTimeout(this._rt); this._rt = setTimeout(function () { self.unring(); }, ms || 7000);
    return els.length > 0;
  };
  P.unring = function () { this.root.querySelectorAll('.hint-ring').forEach(function (e) { e.classList.remove('hint-ring'); }); };

  AM.Phone = Phone;
})();
