# Aprendo con mi móvil

Web para personas de más de 65 años que acaban de empezar con el móvil. Es una web **estática** (HTML + CSS + JS, sin npm ni servidor), igual que `clicApp`: se abre por `file://` desde un pendrive o se sube a cualquier hosting.

Lo primero que pregunta es **¿qué móvil tienes? (iPhone 🍎 / Android)** y, si es iPhone, si tiene botón redondo abajo. A partir de ahí todo se adapta: teclado, botones de navegación, gestos y panel de control.

## Qué enseña

| Módulo | Ejercicios |
|---|---|
| 1 · Dónde se escribe | tocar el cuadro para sacar el teclado (buscador, mensajes, formulario con 3 cuadros, cuadro escondido abajo, lupa), quitar el teclado y volver a sacarlo, **qué pasa si pulsas Inicio o Atrás** (no se pierde nada), reto de 3 pantallas |
| 2 · Teclado | una palabra, espacio, mayúsculas, borrar, números, teclado de teléfono, `@`, `#`, correo, frase entera con coma/número/punto y enviarla, mensaje libre |
| 3 · Panel de arriba / Centro de control | abrirlo con el gesto, encontrar iconos, Wi-Fi, linterna, Bluetooth, modo avión, brillo, **editar los iconos** (Android: lápiz ✎, añadir captura de pantalla, datos móviles y NFC, colocarlos y quitar el NFC; iPhone: Ajustes › Centro de control con grabación de pantalla y lector NFC), cerrarlo, reto final aleatorio |
| 4 · Moverte y organizar apps | Atrás, Inicio, apps abiertas (ver, cambiar, cerrar una y todas), gestos (Android sin botones / iPhone), mover apps, crear carpetas, ponerles nombre, meter otra app, desinstalar o eliminar, reto |
| 5 · Copiar y pegar | mantener pulsado para elegir texto, tiradores, copiar, pegar en otra app, cortar, copiar una foto y pegarla en un mensaje, reto con una web |

Cada ejercicio de escribir va en dos tiempos: **primero "Mira"** (un dedo va pulsando las teclas solo) y **luego "Ahora tú"** (con un círculo naranja sobre la tecla que toca; el botón 💡 Pista lo activa/repite). Al acabar cada ejercicio sale una felicitación.

## Cómo usarla en clase

- **Abrir:** `index.html` directamente, o servirla: `python3 -m http.server 8080` dentro de esta carpeta. Para que los alumnos entren desde su móvil, súbela a cualquier hosting estático y comparte el enlace o un QR (no hay nada desplegado todavía).
- **Proyector:** el móvil simulado se escala solo hasta 1,75× para ocupar la pantalla; los botones **A− / A+** de la cabecera cambian el tamaño del texto; 🔊 activa un sonidito al acertar (apagado por defecto).
- **Saltar a un ejercicio:** en el menú, "Ver todos los ejercicios" de cada módulo. También por enlace: `index.html#/m/2/4` = módulo 2, ejercicio 5 (empiezan en 0). Si el navegador no tiene guardado el tipo de móvil, pregunta primero.
- **Progreso:** se guarda en el navegador (`localStorage`, clave `aprendoMovil.v1`) al terminar cada ejercicio. Si el alumno pulsa Atrás, Inicio o recarga la página, vuelve al menú y "Continuar" lo deja en su ejercicio. Si el navegador bloquea el almacenamiento, funciona igual pero sin guardar.
- **Botón "Saltar ejercicio"** y **"Cambiar de móvil / Borrar mi progreso"** (al final del menú) están pensados para el profesor.

## Cambios tras la primera prueba en clase

- Módulo 1: ejercicio de **buscar en Ajustes** (la lista se filtra al escribir). Módulo 2: ejercicio de **tildes** (mantener pulsada la vocal).
- Teclas, iconos, textos de copiar/pegar y barras más grandes. El móvil ocupa todo el ancho en pantallas pequeñas; botón flotante «Ver las instrucciones».
- Panel / centro de control: se abre arrastrando **desde cualquier sitio** de la pantalla de inicio y se cierra arrastrando desde cualquier sitio. Los gestos de abajo y de los lados ya no tapan teclas ni botones; zonas más grandes.
- iPhone: el centro de control se edita **dentro del propio centro** (+, −, arrastrar, «Añadir un control», OK); en iPhone antiguos sigue Ajustes › Centro de control.
- Arrastrar apps: mantener 0,35 s, aviso visual al soltar sobre otra app (carpeta), celda más cercana, funciona con el **dedo**. «Deshacer» al desinstalar. Botón «↻ Repetir» y «Saltar ejercicio» siempre visibles.
- Brillo visible (oscurece y aclara). Doble pulsación del botón del iPhone más pausada y sin zoom.

## Responsive

Funciona de 320 px a pantallas de proyector y con la letra de 16 a 32 px (A−/A+): sin scroll horizontal, cabecera que se pliega, y el móvil simulado se escala a la pantalla (en móvil pequeño las instrucciones quedan fijas arriba si caben; si el texto es muy grande se desplazan con la página). `node test/responsive.js` lo comprueba en 7 tamaños × 4 tamaños de letra × Android/iPhone.

## Fidelidad a la realidad

El teclado, el panel y los gestos copian lo que de verdad cambia entre sistemas:

- **Android** (Gboard en español): `?123`/`ABC`/`=\<`, números pequeños sobre las letras, coma y punto junto al espacio, `@` y `#` en la 2.ª fila de símbolos, barra de sugerencias, la tecla Atrás cambia a ▾ con el teclado abierto, Atrás en una app = salir al inicio. Panel de ajustes rápidos con **dos arrastres** (compacto → completo), iconos en azul/gris con su estado ("Casa_Wifi", "Desactivado").
- **iPhone** (teclado de Apple en español): `123`/`ABC`/`#+=`, **sin coma ni punto en la página de letras**, `#` en la 3.ª página, el espacio devuelve a las letras, la tecla de acción cambia a "buscar/siguiente/OK", teclado de teléfono con letras bajo los números, tocar un sitio vacío quita el teclado. Centro de control **sin etiquetas** (como el real), que sale desde la **esquina superior derecha** (sin botón) o **desde abajo** (con botón). Arrastrar desde arriba a la izquierda abre Notificaciones y lo explica.
- Los gestos hay que **arrastrarlos**: si solo tocan el borde, un aviso lo explica. Con ratón se puede arrastrar la pantalla del móvil o usar la rueda.
- Apagar el modo avión restaura Wi-Fi/Bluetooth, linterna con halo, brillo que oscurece la pantalla.

- En Android la `@` se busca siempre tras `?123`, también en los cuadros de correo.

Limitaciones conocidas: no hay acentos por pulsación larga (`á`, `é`…), emojis ni dictado; en Samsung/Xiaomi el panel se ve algo distinto (se avisa en el ejercicio); el teclado es simulado (no se usa el del móvil del alumno) para controlar los ejercicios.

## Estructura

```
index.html          cabecera + carga de scripts
css/app.css         web (menús, panel de instrucciones, felicitación)
css/phone.css       móvil simulado, teclados, paneles
icons/             favicon (móvil con un dedo a punto de tocar), icono de la app y manifest.webmanifest (se puede «Añadir a la pantalla de inicio»)
js/store.js         progreso (localStorage)
js/phone.js         móvil: pantallas (navegador, chat, formulario, lupa, ajustes, notas, correo, inicio), gestos, panel, estado
js/keyboard.js      Gboard y teclado de Apple + planificador "qué tecla toca" + demostración
js/apps.js          apps abiertas, inicio editable (mover, carpetas, desinstalar), recientes, botones y gestos
js/clip.js          selección de texto, copiar/cortar/pegar, imágenes
js/edit.js          editor de iconos del panel (Android) y Ajustes › Centro de control (iPhone)
js/lessons.js       los ejercicios (buildLessons(os, iosHome))
js/app.js           pantallas de la web y motor de ejercicios (tareas, pistas, felicitaciones)
test/               pruebas con Playwright (ver abajo)
```

Rutas (hash): `#/` (menú o elegir móvil), `#/elegir`, `#/menu`, `#/m/<módulo>/<ejercicio>`.

## Añadir un ejercicio

En `js/lessons.js`, dentro del módulo, añadir `{ title, ok, tasks: [...] }`. Cada tarea:

```js
{ scene: 'chat', cfg: {},                       // pantalla: browser | chat | form | gallery | settings | notes | mail | home
  say: 'texto', hint: '[data-fid="msg"]',       // hint = selector que se marca en naranja
  goal: ev => ev.type === 'focus' && ev.id === 'msg' }     // o want:{name:'wifi',on:false} o type:{field,target,demo,assist}
```

Eventos del móvil: `focus`, `kbd{open}`, `input`, `key`, `send`, `toggle{name,on}`, `slider{name,value}`, `panel{kind,stage}`, `home`, `resume`. El texto de `say` es HTML (`<b>`, `<mark>`, `<kbd>`).

## Pruebas

```
CHROME_PATH=/root/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node test/jugar.js [carpeta_capturas]
```

`jugar.js` juega **todos los ejercicios con ratón de verdad** (Android, iPhone sin botón, iPhone con botón; `W=390 H=844` para tamaño móvil) y falla si alguno se atasca o hay errores de consola. `capturas.js <carpeta>` saca el móvil en varios estados para revisarlo a ojo; `movil.js <carpeta>` captura el tamaño de móvil. Necesitan Playwright (`/root/rp/node_modules`); `AM.slow = 0.05` acelera las demostraciones en los tests.
