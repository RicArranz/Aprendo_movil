/* Progreso guardado en el propio navegador (localStorage). Si se bloquea, la app sigue funcionando sin guardar. */
(function () {
  'use strict';
  var AM = window.AM = window.AM || {};
  var KEY = 'aprendoMovil.v1';
  var def = { os: null, iosHome: null, done: {}, pos: {}, fs: 20, sound: false };
  var s;
  try { s = Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { s = Object.assign({}, def); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sin almacenamiento */ } }
  AM.store = {
    get: function () { return s; },
    set: function (patch) { Object.assign(s, patch); save(); },
    isDone: function (os, m, st) { return !!s.done[os + ':' + m + ':' + st]; },
    markDone: function (os, m, st) { s.done[os + ':' + m + ':' + st] = 1; save(); },
    setPos: function (os, m, st) { s.pos[os] = { m: m, s: st }; save(); },
    reset: function () { s = Object.assign({}, def, { fs: s.fs, sound: s.sound }); save(); }
  };
})();
