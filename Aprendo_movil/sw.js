/* Service worker mínimo: hace la web instalable. No guarda nada en caché, así siempre se ve la última versión. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* red directa */ });
