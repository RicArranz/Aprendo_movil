/* Pregunta una sola vez, en el primer acceso desde cada dispositivo, si quiere instalar la app. */
(function () {
  'use strict';
  var KEY = 'aprendoMovil.install';
  var deferred = null;
  function seen() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  function mark(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ } }
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  if (location.protocol === 'file:') return;
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
  if (standalone) { mark('instalada'); return; }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { mark('instalada'); close(); });
  if (seen()) return;

  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function steps() {
    if (ios) return '<ol><li>Toca el botón <b>Compartir</b> (un cuadrado con una flecha hacia arriba), abajo en <b>Safari</b>.</li><li>Elige <b>Añadir a pantalla de inicio</b>.</li><li>Toca <b>Añadir</b>.</li></ol>';
    return '<ol><li>Toca el menú del navegador (<b>⋮</b> o <b>⋯</b>, arriba o abajo).</li><li>Elige <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</li><li>Confirma.</li></ol>';
  }
  function ask() {
    if (seen() || box) return;
    box = document.createElement('div');
    box.className = 'inst';
    box.innerHTML = '<div class="inst-box" role="dialog" aria-modal="true" aria-labelledby="instT"><img src="icons/icon-192.png" alt="" width="72" height="72">' +
      '<h2 id="instT">¿Quieres tener la app en tu móvil?</h2><p>Así la abres con un toque desde tu pantalla de inicio, como cualquier otra app.</p>' +
      '<div class="inst-steps" hidden></div><div class="inst-btns"><button class="btn" id="instYes">Sí, instalar</button><button class="pill" id="instNo">Ahora no</button></div></div>';
    document.body.appendChild(box);
    document.getElementById('instNo').onclick = function () { mark('no'); close(); };
    document.getElementById('instYes').onclick = function () {
      mark('preguntada');
      if (deferred) {
        var d = deferred; deferred = null; close(); d.prompt();
      } else {
        var st = box.querySelector('.inst-steps'); st.innerHTML = steps(); st.hidden = false;
        var y = document.getElementById('instYes'); y.textContent = 'Entendido'; y.onclick = close;
        document.getElementById('instNo').hidden = true;
      }
    };
  }
  window.addEventListener('load', function () { setTimeout(ask, 1500); });
})();
