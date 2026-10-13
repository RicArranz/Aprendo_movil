/* Contenido de los ejercicios. buildLessons(os, iosHome) devuelve los 3 módulos ya adaptados al sistema del alumno.
   Una "tarea" es una pantalla con una cosa que hacer:
     scene/cfg   pantalla del móvil           say / explain   texto para el alumno (explain = "mira cómo se hace")
     goal(ev,p)  true cuando lo ha hecho      want {name,on}  para los iconos de encender/apagar
     type        {field,target,prefill,demo,assist}  ejercicio de escribir
     hint        selector que se marca con un círculo naranja     show(p)  animación "enséñame"
     wrong(ev,p) texto amable si hace otra cosa    setup(p) deja el móvil en el estado de partida */
(function () {
  'use strict';
  var AM = window.AM = window.AM || {};

  AM.buildLessons = function (os, iosHome) {
    var A = os === 'android', I = !A, BTN = I && iosHome === 'button';
    var T = function (a, i) { return A ? a : i; };
    var key = function (t) { return '<kbd>' + t + '</kbd>'; };
    var SYM = key(T('?123', '123')), ABC = key('ABC'), BACK = key('⌫'), SHIFT = key('⇧');
    var focusOn = function (id, wrongMsg) {
      return {
        goal: function (ev) { return ev.type === 'focus' && ev.id === id; },
        wrong: function (ev) { return ev.type === 'focus' && ev.id !== id ? wrongMsg : null; },
        hint: '[data-fid="' + id + '"]'
      };
    };
    var task = function (base, extra) { return Object.assign({}, base, extra); };
    var typed = function (scene, cfg, field, target, o) {
      o = o || {};
      return { scene: scene, cfg: cfg, explain: o.explain, say: o.say, type: { field: field, target: target, prefill: o.prefill, demo: o.demo !== false, assist: o.assist !== false }, hint: '[data-fid="' + field + '"]', mess: o.mess };
    };
    var M = [];

    /* ============ MÓDULO 1 ============ */
    var m1 = [];
    m1.push({
      title: 'Tocar el cuadro para escribir', ok: 'Al tocar el cuadro ha salido el <b>teclado</b> desde abajo. Ese es el truco: <b>tocar el cuadro</b>.',
      tasks: [task({
        scene: 'browser',
        say: 'Para escribir hay que tocar un <b>cuadro</b>. Se reconoce porque tiene <b>borde</b> y unas letras <b>grises</b> que dicen qué escribir.<br>' +
          T('Toca con el dedo el cuadro que dice <mark>Buscar en Google</mark>.', 'Toca con el dedo el cuadro de <b>abajo del todo</b> que dice <mark>Buscar o introducir sitio web</mark>.')
      }, focusOn('q', ''))]
    });
    m1.push({
      title: 'El cuadro de los mensajes', ok: 'Muy bien. En las conversaciones, el cuadro para escribir siempre está <b>abajo del todo</b>.',
      tasks: [task({
        scene: 'chat',
        say: 'Estás en una conversación con tu hija Marta. ¿Dónde se escribe un mensaje? <b>Abajo del todo</b>, en el cuadro que dice <mark>' + T('Mensaje', 'iMessage') + '</mark>. Tócalo.'
      }, focusOn('msg', ''))]
    });
    m1.push({
      title: 'Cada cuadro, su teclado', ok: T('El móvil cambia el teclado según lo que pidas: letras para el nombre y <b>números</b> para el teléfono. La <b>@</b> está en el botón <kbd>?123</kbd>.', 'El móvil cambia el teclado según lo que pidas: letras para el nombre, <b>números</b> para el teléfono y la <b>@</b> para el correo.'),
      tasks: [
        task({ scene: 'form', cfg: {}, say: 'Aquí hay tres cuadros. Cada uno es para una cosa. Toca el que dice <mark>Nombre</mark>.' }, focusOn('name', 'Ese es otro cuadro. Busca el que dice «Nombre».')),
        task({ scene: 'form', cfg: {}, say: 'Ahora toca el de <mark>Teléfono</mark>. Fíjate: el teclado cambia y ahora solo tiene <b>números</b>.' }, focusOn('tel', 'Ese es otro cuadro. Busca el que dice «Teléfono».')),
        task({ scene: 'form', cfg: {}, say: T('Por último, toca <mark>Correo electrónico</mark>. Para escribir la <b>@</b> tendrás que cambiar de teclado con el botón <kbd>?123</kbd> (lo practicamos en el módulo 2).', 'Por último, toca <mark>Correo electrónico</mark>. Mira: ahora el teclado trae la <b>@</b> a mano.') }, focusOn('mail', 'Ese es otro cuadro. Busca el que dice «Correo electrónico».'))
      ]
    });
    m1.push({
      title: 'Cuando el cuadro no se ve', ok: 'Perfecto. Si no ves lo que buscas, <b>desliza el dedo</b> hacia arriba o hacia abajo: la pantalla se mueve como una hoja de papel.',
      tasks: [task({
        scene: 'form', cfg: { only: ['comment'], long: true, intro: 'Apúntate al taller. Escribe tu comentario abajo.' },
        say: 'A veces el cuadro está más abajo y no se ve. <b>Desliza el dedo hacia arriba</b> por la pantalla, como si empujaras una hoja de papel, hasta ver el cuadro <mark>Comentario</mark>. Luego tócalo.<br><small>(Con el ratón: gira la rueda o arrastra la pantalla.)</small>',
        show: function (p) { return p.demoSwipe('up-app'); }
      }, focusOn('comment', ''))]
    });
    m1.push({
      title: 'La lupa 🔍', ok: 'Eso es. Una <b>lupa</b> casi siempre significa «buscar»: al tocarla aparece el cuadro para escribir.',
      tasks: [task({
        scene: 'gallery',
        say: 'A veces el cuadro está escondido y solo se ve una <b>lupa</b> 🔍. Toca la lupa de <b>arriba a la derecha</b> para que aparezca el cuadro.',
      }, Object.assign(focusOn('search', ''), { hint: '[data-reveal]' }))]
    });
    m1.push({
      title: 'Se me ha ido el teclado', ok: 'Si el teclado desaparece, no pasa nada: <b>vuelve a tocar el cuadro</b> y sale otra vez.',
      tasks: [
        task({ scene: 'browser', say: 'Primero saca el teclado: toca el cuadro de buscar.' }, focusOn('q', '')),
        {
          scene: 'browser',
          say: T('Ahora vamos a quitarlo. Pulsa el botón de abajo a la izquierda: el triángulo, que ahora apunta hacia <b>abajo</b> ▾.',
            'Ahora vamos a quitarlo. Toca cualquier <b>sitio vacío</b> de la pantalla (por ejemplo, el fondo de arriba).'),
          hint: T('.nb-back', '.sf-fav-t'),
          goal: function (ev) { return ev.type === 'kbd' && !ev.open; }
        },
        task({ scene: 'browser', say: '¿Se ha ido? No pasa nada. Para que vuelva, toca otra vez el cuadro de buscar.' }, focusOn('q', ''))
      ]
    });
    var homeHow = A ? 'el botón redondo <b>●</b> del centro, abajo' : (BTN ? 'el <b>botón redondo</b> que hay debajo de la pantalla' : 'desliza el dedo desde la <b>rayita de abajo</b> hacia arriba');
    var homeT = [
      {
        scene: 'notes',
        say: 'Vamos a hacer una prueba para que pierdas el miedo. Imagina que, sin querer, vas a salir. Pulsa ' + homeHow + '.',
        hint: A ? '.nb-home' : (BTN ? '.p-hw' : '.home-ind'),
        show: (!A && !BTN) ? function (p) { return p.demoSwipe('home-up'); } : null,
        goal: function (ev) { return ev.type === 'home'; }
      },
      {
        scene: 'notes',
        say: 'Estás en la pantalla de inicio. <b>No pasa nada</b>: tu ejercicio sigue ahí esperándote. Toca el icono que <b>brilla</b> para volver.',
        hint: '.app.glow', goal: function (ev) { return ev.type === 'resume'; }
      }
    ];
    if (A) {
      homeT.push({
        scene: 'notes', say: 'Ahora prueba el botón de <b>Atrás</b>, el triángulo <b>◀</b> de abajo a la izquierda. Aquí sale de la aplicación, igual que Inicio.',
        hint: '.nb-back', goal: function (ev) { return ev.type === 'home'; }
      });
      homeT.push({ scene: 'notes', say: 'Otra vez en el inicio. Toca el icono que <b>brilla</b> para volver.', hint: '.app.glow', goal: function (ev) { return ev.type === 'resume'; } });
    }
    m1.push({ title: 'Inicio y Atrás: no se pierde nada', ok: 'Ya lo sabes: si pulsas ' + (A ? 'Inicio o Atrás' : 'Inicio') + ' sin querer, <b>no se pierde nada</b>. Y esta página también guarda por dónde vas.', tasks: homeT });
    m1.push({
      title: 'Buscar algo en Ajustes', ok: 'Mira qué cómodo: al escribir, <b>Ajustes te enseña solo lo que se parece</b>. Así se encuentra cualquier cosa sin dar mil vueltas.',
      tasks: [
        { scene: 'settings', hint: '[data-fid="q"]', goal: function (ev) { return ev.type === 'focus' && ev.id === 'q'; }, say: 'Vamos a <b>buscar algo en Ajustes</b>. Imagina que la pantalla se ve demasiado oscura y quieres cambiar el <b>brillo</b>. Toca el cuadro de buscar, arriba.' },
        { type: { field: 'q', target: 'brillo', demo: false, assist: true }, hint: '[data-fid="q"]', say: 'Escribe la palabra <mark>brillo</mark>. Fíjate en cómo la lista de abajo se va reduciendo.' }
      ]
    });
    m1.push({
      title: 'Reto: encuentra el cuadro', ok: 'Ya sabes encontrar dónde se escribe en cualquier pantalla.',
      tasks: [
        task({ scene: 'settings', say: 'Reto 1 de 3 · <b>Ajustes</b>. Busca el cuadro para buscar y tócalo.' }, focusOn('q', 'Ese no es un cuadro de escribir. Busca el que tiene la lupa.')),
        task({ scene: 'mail', say: 'Reto 2 de 3 · <b>Correo</b>. Toca el cuadro donde se pone <mark>Para</mark> (a quién va el correo).' }, focusOn('to', 'Casi. Busca la fila que dice «Para».')),
        task({ scene: 'chat', say: 'Reto 3 de 3 · <b>Mensajes</b>. Toca el cuadro donde se escribe el mensaje.' }, focusOn('msg', ''))
      ]
    });
    M.push({ id: 1, icon: 'field', title: 'Dónde se escribe', desc: 'Encontrar el cuadro y tocarlo para que salga el teclado.', steps: m1 });

    /* ============ MÓDULO 2 ============ */
    var m2 = [];
    m2.push({
      title: 'Escribir una palabra', ok: 'Ya has escrito tu primera palabra. Las letras se pulsan <b>una detrás de otra</b>.',
      tasks: [typed('notes', {}, 'note', 'sol', {
        explain: 'Primero <b>mira</b> cómo lo hago yo. Voy a escribir la palabra <mark>sol</mark>: una letra detrás de otra.',
        say: 'Ahora te toca a ti. Escribe <mark>sol</mark>. Te marco con un círculo naranja la tecla que toca.'
      })]
    });
    m2.push({
      title: 'El espacio entre palabras', ok: 'Muy bien. La barra larga de abajo, el <b>espacio</b>, separa las palabras. Y la primera letra salió <b>grande</b> sola.',
      tasks: [typed('notes', {}, 'note', 'Hola amigo', {
        explain: 'Mira: para separar dos palabras se pulsa la <b>barra larga</b> de abajo, que se llama <b>espacio</b>. La primera letra sale grande ella sola.',
        say: 'Tu turno. Escribe <mark>Hola amigo</mark>.'
      })]
    });
    m2.push({
      title: 'Letras mayúsculas', ok: 'Eso es. Para una letra grande se pulsa ' + SHIFT + ' (la flecha hacia arriba) <b>justo antes</b> de la letra.',
      tasks: [typed('notes', {}, 'note', 'Hola Marta', {
        explain: 'Los nombres llevan la primera letra grande. Mira: pulso la flecha hacia arriba ' + SHIFT + ' y <b>luego</b> la letra.',
        say: 'Ahora tú. Escribe <mark>Hola Marta</mark>. Para la <b>M</b> pulsa antes la flecha ' + SHIFT + '.'
      })]
    });
    m2.push({
      title: 'Borrar si me equivoco', ok: 'Equivocarse es normal. Con ' + BACK + ' se borra la última letra. <b>Si lo dejas pulsado</b>, borra más rápido.',
      tasks: [typed('notes', {}, 'note', 'casa', {
        prefill: 'cassa',
        explain: 'Aquí hay un fallo: «cassa» lleva una <b>s de más</b>. Mira cómo se arregla con la tecla de borrar ' + BACK + ' (la flecha con una X).',
        say: 'Ahora tú. Borra lo que sobra para que ponga <mark>casa</mark>. Si te equivocas otra vez, no pasa nada.'
      })]
    });
    m2.push({
      title: 'Las tildes: á é í ó ú', ok: 'Eso es: <b>mantener pulsada la vocal</b> hace que salgan sus tildes. La primera (la de la izquierda) es la normal en español.',
      tasks: [typed('notes', {}, 'note', 'María', {
        explain: 'Para poner una <b>tilde</b> (la rayita de «María») no hay tecla: se <b>mantiene pulsada la vocal</b> y salen sus versiones. Mira: mantengo la <b>I</b> y elijo la <b>í</b>.',
        say: 'Ahora tú. Escribe <mark>María</mark>. Cuando llegues a la <b>i</b>, <b>no la sueltes</b>: espera a que salgan las opciones y toca la <b>í</b>.'
      })]
    });
    m2.push({
      title: 'Escribir números', ok: 'Muy bien. Los números están en <b>otra página</b> del teclado: ' + SYM + ' para ir, ' + ABC + ' para volver a las letras.',
      tasks: [typed('notes', {}, 'note', 'Tengo 3 nietos', {
        explain: 'Los números no están en las letras. Hay que pasar a <b>otra página</b> del teclado con ' + SYM + ' y, para volver a las letras, ' + ABC + '.' +
          (I ? ' (En el iPhone, al pulsar el espacio, vuelves solo a las letras.)' : ''),
        say: 'Tu turno. Escribe <mark>Tengo 3 nietos</mark>.'
      })]
    });
    m2.push({
      title: 'El teclado del teléfono', ok: 'Cuando el cuadro es para un teléfono, el teclado trae <b>solo números</b>, grandes y fáciles.',
      tasks: [typed('form', { only: ['tel'] }, 'tel', '600123456', {
        explain: 'Cuando el cuadro es para un <b>teléfono</b>, el móvil saca solo números. Mira cómo escribo un número.',
        say: 'Ahora tú. Escribe el número <mark>600 123 456</mark>, todo seguido y sin espacios.'
      })]
    });
    m2.push({
      title: 'La arroba @', ok: 'Ya sabes dónde está la <b>@</b>: en la página de números y símbolos. La necesitarás para el correo.',
      tasks: [typed('notes', {}, 'note', '@', {
        explain: 'La <b>@</b> se llama arroba. Está en la página de números y símbolos: pulsa ' + SYM + ' y búscala ' + T('en la segunda fila, la primera tecla.', 'en la segunda fila, casi al final.'),
        say: 'Ahora tú. Escribe una <mark>@</mark>.'
      })]
    });
    m2.push({
      title: 'La almohadilla #', ok: 'Muy bien. La <b>#</b> (almohadilla) es otro símbolo que se esconde en las páginas de símbolos.',
      tasks: [typed('notes', {}, 'note', '#', {
        explain: T('La <b>#</b> se llama almohadilla. Está en la misma página que la @: pulsa ' + SYM + ' y es la segunda tecla de la segunda fila.',
          'La <b>#</b> se llama almohadilla y en el iPhone está más escondida: pulsa ' + SYM + ' y luego la tecla <kbd>#+=</kbd> (a la izquierda, en la tercera fila). Ahí está.'),
        say: 'Ahora tú. Escribe una <mark>#</mark>.'
      })]
    });
    m2.push({
      title: 'Escribir un correo', ok: T('¡Ya sabes escribir una dirección de correo! Recuerda: la <b>@</b> está detrás de ' + SYM + '.', '¡Ya sabes escribir una dirección de correo! La <b>@</b> y el <b>punto</b> estaban a mano.'),
      tasks: [typed('mail', {}, 'to', 'ana@correo.es', {
        explain: T('Para la <b>@</b> hay que pulsar primero ' + SYM + ' (cambia de teclado), buscar la @ y volver a las letras con ' + ABC + '. Mira cómo escribo una dirección.', 'En el cuadro de un correo, el teclado ya trae la <b>@</b> y el <b>punto</b> cerca del espacio. Mira cómo escribo una dirección.'),
        say: 'Ahora tú. Escribe <mark>ana@correo.es</mark>.'
      })]
    });
    m2.push({
      title: 'Una frase entera', ok: 'Mensaje enviado. Has escrito con <b>mayúscula, coma, números y punto</b>. Eso ya es escribir de verdad.',
      tasks: [
        typed('chat', {}, 'msg', 'Hola, tengo 70 años.', {
          assist: false,
          explain: 'Ahora una frase con de todo: una <b>coma</b>, un <b>número</b> y un <b>punto</b>. ' + T('La coma y el punto están al lado de la barra del espacio.', 'En el iPhone la coma y el punto están en la página ' + SYM + '.') + ' Mira.',
          say: 'Ahora tú. Escribe <mark>Hola, tengo 70 años.</mark><br>Si te pierdes, pulsa «Pista» y te marco la tecla.'
        }),
        { scene: 'chat', say: 'Ya está escrito. Para enviarlo, toca el botón de <b>enviar</b> (la flechita ➤ al lado del cuadro).', hint: '.sendb', goal: function (ev) { return ev.type === 'send'; } }
      ]
    });
    m2.push({
      title: 'Reto: escribe tu mensaje', ok: 'Has escrito un mensaje tuyo y lo has enviado. <b>Ya sabes usar el teclado.</b>',
      tasks: [{
        scene: 'chat', say: 'Reto final: escribe <b>lo que tú quieras</b> (por ejemplo, <mark>Hola Marta, ya sé escribir</mark>) y envíalo con el botón ➤.',
        hint: '[data-fid="msg"]', goal: function (ev) { return ev.type === 'send' && ev.text.length >= 4; }
      }]
    });
    M.push({ id: 2, icon: 'keyboard', title: 'Aprender el teclado', desc: 'Letras, mayúsculas, borrar, números, @, # y una frase entera.', steps: m2 });

    /* ============ MÓDULO 3 ============ */
    var m3 = [];
    var stageFull = A ? 2 : 1, kind = A ? 'qs' : 'cc';
    var openFull = function (p) { p.openPanel(kind, stageFull, true); };
    var iconsPlace = {
      wifi: T('el de las <b>ondas</b> 📶 (arriba a la izquierda)', 'el redondo con <b>ondas</b>, abajo a la izquierda del grupo de cuatro'),
      bt: T('el que pone <b>Bluetooth</b> (arriba a la derecha)', 'el redondo de <b>abajo a la derecha</b> del grupo de cuatro'),
      torch: T('el que pone <b>Linterna</b>', 'el botón de <b>abajo a la izquierda</b> con una linterna'),
      air: T('el que pone <b>Modo avión</b> (con un avioncito)', 'el redondo de <b>arriba a la izquierda</b> del grupo de cuatro (un avioncito)')
    };
    var toggleTask = function (name, on, say, o) {
      o = o || {};
      return {
        scene: 'home', want: { name: name, on: on }, hint: '[data-tile="' + name + '"]', say: say,
        setup: function (p) { p.resetState(); p.set(Object.assign({}, o.pre || {}, (function () { var x = {}; x[name] = !on; return x; })())); p.setBright(70, true); openFull(p); }
      };
    };
    var openTask = {
      scene: 'home',
      setup: function (p) { p.resetState(); },
      show: function (p) { return p.demoSwipe(A ? 'top' : (BTN ? 'cc-bottom' : 'cc-right')); },
      goal: function (ev) { return ev.type === 'panel' && ev.kind === kind && ev.stage >= 1; },
      wrong: function (ev) {
        if (ev.type === 'panel' && ev.kind === 'notif') return BTN ? 'Eso son las notificaciones (has empezado por arriba). El centro de control sale desde <b>abajo</b>. Ciérralo deslizando hacia arriba y prueba otra vez.' : 'Eso son las notificaciones. El centro de control sale desde la esquina de la <b>derecha</b>. Ciérralo deslizando hacia arriba y prueba otra vez.';
        return null;
      }
    };
    openTask.say = A
      ? 'Este panel tiene los iconos para <b>encender y apagar</b> cosas (el Wi-Fi, la linterna…). Para abrirlo, pon el dedo <b>arriba del todo</b> de la pantalla, donde está la hora, y <b>arrástralo hacia abajo</b>, como si bajaras una persiana. <b>Aquí, en el inicio, vale empezar desde cualquier sitio de la pantalla</b>.<br><small>(En algunos móviles, como los Samsung, se ve un poco distinto, pero se abre igual.)</small>'
      : (BTN ? 'El <b>centro de control</b> tiene los botones para <b>encender y apagar</b> cosas (el Wi-Fi, la linterna…). Para abrirlo, pon el dedo en la parte de abajo de la pantalla y <b>arrástralo hacia arriba</b>. <b>Aquí, en el inicio, vale empezar desde cualquier sitio</b>.'
        : 'El <b>centro de control</b> tiene los botones para <b>encender y apagar</b> cosas (el Wi-Fi, la linterna…). Para abrirlo, pon el dedo en el <b>lado derecho</b> de la pantalla (arriba del todo, donde están la batería y el Wi-Fi, o más abajo) y <b>arrástralo hacia abajo</b>. <b>Aquí, en el inicio, vale empezar desde cualquier sitio del lado derecho</b>.');
    m3.push({
      title: A ? 'Abrir el panel de arriba' : 'Abrir el centro de control',
      ok: A ? 'Eso es: ya has abierto el panel. Los <b>iconos</b> sirven para encender y apagar cosas.' : 'Eso es: ya has abierto el centro de control. Cada botón enciende o apaga una cosa.',
      tasks: [openTask]
    });
    if (A) {
      m3.push({
        title: 'Ver todos los iconos', ok: 'Muy bien. Con <b>dos arrastres</b> se ve el panel entero.',
        tasks: [{
          scene: 'home', setup: function (p) { p.resetState(); p.openPanel('qs', 1, true); },
          say: 'Ahora solo se ven unos pocos iconos. Para ver <b>todos</b>, <b>vuelve a arrastrar</b> desde arriba del todo hacia abajo.',
          show: function (p) { return p.demoSwipe('top'); }, goal: function (ev) { return ev.type === 'panel' && ev.stage === 2; }
        }]
      });
    }
    m3.push({
      title: 'Apagar y encender el Wi-Fi', ok: 'El <b>Wi-Fi</b> es internet de casa. Si está <b>apagado</b>, no puedes ver vídeos ni mensajes (salvo con datos). Azul = encendido; gris = apagado.',
      tasks: [
        toggleTask('wifi', false, 'El <b>Wi-Fi</b> es ' + iconsPlace.wifi + '. Si está en <b>azul</b>, está encendido. Tócalo para <b>apagarlo</b>.'),
        toggleTask('wifi', true, 'Mira: el icono se ha puesto <b>gris</b> y, arriba del todo, ha desaparecido el dibujito del Wi-Fi. Ahora tócalo otra vez para <b>encenderlo</b>.')
      ].map(function (t, i) { if (i === 1) t.setup = function (p) { p.resetState(); p.set({ wifi: false }); openFull(p); }; return t; })
    });
    m3.push({
      title: 'La linterna', ok: 'Ya tienes linterna siempre contigo. Y arriba, junto a la hora, ves un dibujito mientras está encendida.',
      tasks: [
        toggleTask('torch', true, 'La <b>linterna</b> es ' + iconsPlace.torch + '. Tócala para <b>encenderla</b>. ¡Verás una luz amarilla alrededor del móvil!'),
        toggleTask('torch', false, 'Ahora tócala otra vez para <b>apagarla</b> y no gastar batería.')
      ].map(function (t, i) { if (i === 1) t.setup = function (p) { p.resetState(); p.set({ torch: true }); openFull(p); }; return t; })
    });
    m3.push({
      title: 'El Bluetooth', ok: 'El <b>Bluetooth</b> sirve para conectar sin cables: auriculares, un altavoz, un reloj… Si no lo usas, puedes dejarlo apagado.',
      tasks: [
        toggleTask('bt', true, 'El <b>Bluetooth</b> es ' + iconsPlace.bt + '. Está apagado. Tócalo para <b>encenderlo</b>.'),
        toggleTask('bt', false, 'Ahora tócalo otra vez para <b>apagarlo</b>.')
      ].map(function (t, i) { if (i === 1) t.setup = function (p) { p.resetState(); p.set({ bt: true }); openFull(p); }; return t; })
    });
    m3.push({
      title: 'El modo avión ✈️', ok: 'El <b>modo avión</b> corta de golpe Wi-Fi, Bluetooth y llamadas. Se usa en los aviones o para estar tranquilo. Al quitarlo, todo vuelve.',
      tasks: [
        toggleTask('air', true, 'El <b>modo avión</b> es ' + iconsPlace.air + '. Tócalo y mira lo que pasa con el Wi-Fi.', { pre: { wifi: true, bt: true } }),
        { scene: 'home', want: { name: 'air', on: false }, hint: '[data-tile="air"]', say: 'Fíjate: se ha apagado el Wi-Fi y no hay llamadas. Ahora tócalo otra vez para <b>quitar el modo avión</b>.', setup: function (p) { p.resetState(); p.toggle('air', true); openFull(p); } }
      ]
    });
    m3.push({
      title: 'El brillo de la pantalla', ok: 'Muy bien. Si la pantalla se ve oscura, <b>sube el brillo</b>; si te molesta la luz, bájalo.',
      tasks: [
        {
          scene: 'home', setup: function (p) { p.resetState(); openFull(p); }, hint: '[data-slider="bright"]',
          say: 'La barra con el <b>sol</b> ☀ es el <b>brillo</b>. Con el dedo, arrástrala hacia ' + T('la <b>derecha</b>', 'arriba') + ' para que la pantalla se vea más clara.',
          goal: function (ev) { return ev.type === 'slider' && ev.name === 'bright' && ev.value >= 85; }
        },
        {
          scene: 'home', hint: '[data-slider="bright"]',
          say: 'Ahora al revés: arrastra la barra hacia ' + T('la <b>izquierda</b>', 'abajo') + ' para que la pantalla se vea más oscura.',
          goal: function (ev) { return ev.type === 'slider' && ev.name === 'bright' && ev.value <= 25; }
        },
        {
          scene: 'home', hint: '[data-slider="bright"]',
          say: 'Y para dejarla cómoda, arrastra la barra hasta la <b>mitad</b>.',
          goal: function (ev) { return ev.type === 'slider' && ev.name === 'bright' && ev.value >= 45 && ev.value <= 75; }
        }
      ]
    });
    /* --- editar los iconos del panel --- */
    var DEFQS = ['wifi', 'bt', 'torch', 'rot', 'air', 'dnd', 'saver', 'loc'];
    var qsReady = function (list, edit) { return function (p) { p.resetState(); p.qsList = list.slice(); p.openPanel('qs', 2, true); if (edit) p.openQsEdit(); }; };
    var ccSetup = function (list) { return function (p) { p.freeApps = true; p.ccList = list.slice(); p.renderScene('ccsettings', {}); }; };
    var DEFCC = ['torch', 'timer', 'calc', 'cam'];
    var openGesture = Object.assign({}, openTask); delete openGesture.scene; delete openGesture.setup;
    if (A) {
      m3.push({
        title: 'Editar los iconos del panel', ok: 'Con el lápiz ✎ se cambia qué iconos tiene el panel. Los que quitas no se pierden: siempre se pueden volver a añadir.',
        tasks: [{
          scene: 'home', setup: qsReady(DEFQS, false), hint: '[data-qs="edit"]', goal: function (ev) { return ev.type === 'qsEditOpen'; },
          say: 'Puedes <b>elegir qué iconos</b> quieres en el panel. Abajo a la izquierda hay un <b>lápiz ✎</b>. Tócalo.'
        }]
      });
      m3.push({
        title: 'Añadir y colocar: captura de pantalla', ok: 'Muy bien. El icono de <b>captura de pantalla</b> ya está en el panel, en el sitio que has elegido.',
        tasks: [
          {
            scene: 'home', setup: qsReady(DEFQS, true), hint: '.qt[data-qt="captura"]', goal: function (ev) { return ev.type === 'qsAdd' && ev.id === 'captura'; },
            say: 'Esto es la pantalla de <b>editar</b>. Arriba están los iconos que <b>ya tienes</b> (numerados) y abajo los que puedes <b>añadir</b>. Toca <mark>Captura de pantalla</mark> para añadirlo.'
          },
          {
            hint: '.act .qt[data-i="0"]', show: function (p) { return p.demoSwipe('dragto', p.q('.act .qt[data-qt="captura"]'), p.q('.act .qt[data-i="0"]')); },
            say: 'Se ha puesto el <b>último</b>. Vamos a <b>colocarlo el primero</b>: mantén el dedo sobre él, arrástralo hasta el sitio número <mark>1</mark> y suéltalo.',
            skipIf: function (p) { return p.qsList[0] === 'captura'; },
            goal: function (ev, p) { return ev.type === 'qsEdit' && p.qsList[0] === 'captura'; }
          }
        ]
      });
      m3.push({
        title: 'Añadir los datos móviles', ok: 'Los <b>4 primeros</b> iconos son los que ves al primer arrastre; por eso conviene poner ahí los que más usas.',
        tasks: [
          {
            scene: 'home', setup: qsReady(['captura'].concat(DEFQS), true), hint: '.qt[data-qt="data"]', goal: function (ev) { return ev.type === 'qsAdd' && ev.id === 'data'; },
            say: 'Ahora añade los <mark>Datos móviles</mark> (el triángulo de la cobertura). Tócalo.'
          },
          {
            hint: '.act .qt[data-i="3"]', show: function (p) { return p.demoSwipe('dragto', p.q('.act .qt[data-qt="data"]'), p.q('.act .qt[data-i="2"]')); },
            say: 'Colócalo entre los <b>cuatro primeros</b> (los que tienen el borde azul): arrástralo hasta uno de esos sitios.',
            skipIf: function (p) { return p.qsList.indexOf('data') < 4; },
            goal: function (ev, p) { return ev.type === 'qsEdit' && p.qsList.indexOf('data') < 4; }
          }
        ]
      });
      m3.push({
        title: 'Añadir y quitar el NFC', ok: 'Perfecto: sabes añadir y <b>quitar</b> iconos. El NFC sirve para pagar con el móvil; si no lo usas, mejor quitarlo.',
        tasks: [
          {
            scene: 'home', setup: qsReady(['captura', 'data'].concat(DEFQS), true), hint: '.qt[data-qt="nfc"]', goal: function (ev) { return ev.type === 'qsAdd' && ev.id === 'nfc'; },
            say: 'Añade ahora el <mark>NFC</mark> (sirve para pagar acercando el móvil). Tócalo.'
          },
          {
            hint: '.act .qt[data-qt="nfc"] .rm', show: function (p) { return p.demoSwipe('dragto', p.q('.act .qt[data-qt="nfc"]'), p.q('.qe-remove')); },
            say: 'Y ahora <b>quítalo</b>. Tienes dos formas: tocar el círculo rojo <b>−</b> del icono, o arrastrarlo hasta el cuadro <b>«Suelta aquí para quitar»</b>.',
            goal: function (ev) { return ev.type === 'qsRemove' && ev.id === 'nfc'; }
          }
        ]
      });
      m3.push({
        title: 'Guardar y ver cómo queda', ok: 'Ya está. Ahora el panel tiene <b>captura de pantalla y datos móviles</b> a mano, y el NFC ya no estorba.',
        tasks: [{
          scene: 'home', setup: qsReady(['captura', 'wifi', 'data', 'bt', 'torch', 'rot', 'air', 'dnd', 'saver', 'loc'], true), hint: '[data-qs="done"]',
          goal: function (ev) { return ev.type === 'qsEditClose'; },
          say: 'Para salir de editar, toca la <b>flecha ←</b> de arriba a la izquierda. Los cambios se guardan solos.'
        }]
      });
    } else {
      var ccEditReady = function (gallery, list) {
        return function (p) { p.resetState(); if (list) p.ccList = list.slice(); p.openPanel('cc', 1, true); p.panel.edit = true; p.panel.gallery = !!gallery; p.renderPanel(); };
      };
      m3.push({
        title: 'Entrar en el modo editar', ok: 'Eso es: ahora los botones tiemblan y se pueden <b>quitar, mover o añadir</b>.',
        tasks: [{
          scene: 'home', setup: function (p) { p.resetState(); p.openPanel('cc', 1, true); }, hint: '.cc-plus', goal: function (ev) { return ev.type === 'ccEditOpen'; },
          say: 'Puedes <b>elegir qué botones</b> quieres en el centro de control. Está abierto: toca el <b>+</b> de arriba a la izquierda.<br><small>(En iPhone antiguos se hace en Ajustes › Centro de control.)</small>'
        }]
      });
      m3.push({
        title: 'Añadir y colocar un botón', ok: 'Muy bien. El botón de <b>grabar la pantalla</b> ya está en el centro de control, en el sitio que has elegido.',
        tasks: [
          {
            scene: 'home', setup: ccEditReady(false), hint: '.cc-addbar', goal: function (ev) { return ev.type === 'ccGallery'; },
            say: 'Los botones tiemblan: estás editando. Abajo hay un botón <mark>Añadir un control</mark>. Tócalo.<br><small>(En el iPhone la captura de pantalla se hace con los botones del lateral, no está aquí; por eso practicamos con otro.)</small>'
          },
          {
            hint: '[data-ccpick="grab"]', goal: function (ev) { return ev.type === 'ccEdit' && ev.what === 'add' && ev.id === 'grab'; },
            say: 'Esta es la lista de controles que puedes añadir. Toca <mark>Grabación de pantalla</mark>.'
          },
          {
            hint: '.cc-b[data-ccid="grab"]', show: function (p) { return p.demoSwipe('dragto', p.q('.cc-b[data-ccid="grab"]'), p.q('.cc-b[data-ccid="torch"]')); },
            say: 'Se ha puesto el último. Para <b>colocarlo el primero</b>, mantén el dedo sobre él y arrástralo hasta el sitio de la <b>Linterna</b>.',
            skipIf: function (p) { return p.ccList[0] === 'grab'; },
            goal: function (ev, p) { return ev.type === 'ccEdit' && p.ccList[0] === 'grab'; }
          }
        ]
      });
      m3.push({
        title: 'Añadir y quitar el lector NFC', ok: 'Perfecto: sabes añadir y <b>quitar</b> botones del centro de control.',
        tasks: [
          {
            scene: 'home', setup: ccEditReady(true, ['grab'].concat(DEFCC)), hint: '[data-ccpick="nfc"]', goal: function (ev) { return ev.type === 'ccEdit' && ev.what === 'add' && ev.id === 'nfc'; },
            say: 'Añade ahora el <mark>Lector de códigos NFC</mark> (sirve para leer etiquetas acercando el móvil). Tócalo en la lista.'
          },
          {
            hint: '.cc-b[data-ccid="nfc"] .bdg', goal: function (ev) { return ev.type === 'ccEdit' && ev.what === 'remove' && ev.id === 'nfc'; },
            say: 'Y ahora <b>quítalo</b>: toca el círculo gris con el <b>−</b> que tiene en la esquina.'
          }
        ]
      });
      m3.push({
        title: 'Terminar de editar', ok: 'Mira la fila de abajo: el <b>primer botón</b> es el nuevo (grabar pantalla). Tú decides qué botones ves.',
        tasks: [{
          scene: 'home', setup: ccEditReady(false, ['grab'].concat(DEFCC)), hint: '.cc-ok', goal: function (ev) { return ev.type === 'ccEditClose'; },
          say: 'Para terminar, toca <mark>OK</mark> (arriba a la derecha). Los cambios se guardan solos.'
        }]
      });
    }
    m3.push({
      title: 'Cerrar el panel', ok: 'Ya sabes abrir, usar y cerrar el panel. Los cambios se quedan hechos.',
      tasks: [{
        scene: 'home', setup: function (p) { p.resetState(); openFull(p); },
        say: A ? 'Para cerrar el panel, <b>desliza el dedo de abajo hacia arriba</b> sobre él (desde donde quieras), o pulsa el botón <b>Atrás</b> ◀ de abajo.'
          : 'Para cerrar el centro de control, <b>desliza el dedo ' + (BTN ? 'hacia abajo o hacia arriba' : 'hacia arriba') + '</b> desde cualquier sitio, o toca la parte oscura, fuera de los botones.',
        hint: A ? '.nb-back' : '.cc-tip', show: function (p) { return p.demoSwipe('close-up'); },
        goal: function (ev) { return ev.type === 'panel' && ev.stage === 0; }
      }]
    });
    var pool = [
      { name: 'torch', on: true, t: '<b>enciende</b> la linterna' }, { name: 'wifi', on: false, t: '<b>apaga</b> el Wi-Fi' },
      { name: 'bt', on: true, t: '<b>enciende</b> el Bluetooth' }, { name: 'air', on: true, t: 'activa el <b>modo avión</b>' }
    ];
    var retoTasks = function () {
      var pick = pool.slice().sort(function () { return Math.random() - .5; }).slice(0, 3);
      return pick.map(function (r, i) {
        var pre = {}; pre[r.name] = !r.on;
        return {
          scene: 'home', want: { name: r.name, on: r.on }, hint: '[data-tile="' + r.name + '"]',
          say: 'Reto ' + (i + 1) + ' de 3: ' + r.t + '. Primero abre el panel si hace falta.',
          setup: function (p) { p.resetState(); p.set(pre); openFull(p); }
        };
      });
    };
    m3.push({ title: 'Reto final: tú solo/a', ok: 'Has manejado el ' + T('panel de arriba', 'centro de control') + ' sin ayuda.', tasks: retoTasks(), fresh: retoTasks });
    M.push({ id: 3, icon: 'switches', title: A ? 'El panel de arriba' : 'El centro de control', desc: 'Abrirlo, encontrar los iconos y encender o apagar Wi-Fi, linterna, Bluetooth, modo avión y brillo.', steps: m3 });
    /* ============ MÓDULO 4: navegar y organizar apps ============ */
    var m4 = [];
    var free = function (extra) { return function (p) { p.freeApps = true; if (extra) extra(p); }; };
    var recHow = A ? 'el botón cuadrado <b>▢</b> de abajo a la derecha' : (BTN ? '<b>dos veces seguidas</b> el botón redondo de abajo: pulsa… espera un momento… y vuelve a pulsar (sin prisa)' : 'desliza el dedo desde la rayita de abajo hacia arriba y, a mitad de pantalla, <b>espera un segundo sin soltar</b>');
    var recHint = A ? '.nb-rec' : (BTN ? '.p-hw' : '.home-ind');
    var recShow = (!A && !BTN) ? function (p) { return p.demoSwipe('recents-up'); } : null;
    var recWrong = function (ev) { return (!BTN && ev.type === 'home') ? 'Eso te lleva al inicio: has soltado demasiado pronto. Sube y <b>espera un segundo</b> antes de soltar.' : null; };
    var recents = function (ids) { return free(function (p) { p.preload(ids); p.showRecents(); }); };
    var mkFolder = function (p, name, apps, slot) {
      var S = p.layout.slots; apps.forEach(function (a) { S.forEach(function (it, i) { if (it && !it.folder && it.app === a) S[i] = null; }); });
      S[slot] = { folder: true, name: name, apps: apps }; p.renderHome();
    };
    var backTasks = [
      { scene: 'settings', setup: free(), hint: '[data-title="Pantalla"]', goal: function (ev) { return ev.type === 'go'; }, say: 'Estás en <b>Ajustes</b>. Toca <mark>Pantalla</mark> para entrar en ella.' },
      {
        hint: A ? '.nb-back' : '[data-back]', show: (!A && !BTN) ? function (p) { return p.demoSwipe('edge-back'); } : null,
        goal: function (ev) { return ev.type === 'back' && ev.result === 'up'; },
        say: A ? 'Ahora <b>vuelve atrás</b>: pulsa el botón <b>◀</b> de abajo a la izquierda.'
          : 'Ahora <b>vuelve atrás</b>: toca <mark>‹ Ajustes</mark> arriba a la izquierda.' + (BTN ? '' : '<br><small>(También vale poner el dedo en el borde izquierdo y arrastrarlo hacia dentro.)</small>')
      }
    ];
    if (A) backTasks.push({ hint: '.nb-back', goal: function (ev) { return ev.type === 'home'; }, say: 'Pulsa <b>◀</b> otra vez. Como ya estás en la primera pantalla de la app, <b>sales de ella</b> y vas al inicio.' });
    m4.push({ title: A ? 'El botón Atrás' : 'Volver atrás', ok: A ? '<b>◀ Atrás</b> sube un escalón cada vez: primero dentro de la app y, al final, sale al inicio.' : 'En el iPhone se vuelve atrás con el <b>‹</b> de arriba a la izquierda (o con el gesto del borde).', tasks: backTasks });
    m4.push({
      title: 'Ir a la pantalla de inicio', ok: 'El <b>inicio</b> es el «escritorio» del móvil. Se llega desde cualquier sitio, y la app que dejas sigue abierta por detrás.',
      tasks: [{
        scene: 'chat', setup: free(), hint: A ? '.nb-home' : (BTN ? '.p-hw' : '.home-ind'), show: (!A && !BTN) ? function (p) { return p.demoSwipe('home-up'); } : null,
        goal: function (ev) { return ev.type === 'home'; },
        say: 'Estás en una conversación. Para <b>ir al inicio</b> desde cualquier sitio: ' + homeHow + '.'
      }]
    });
    m4.push({
      title: 'Ver las apps abiertas', ok: 'Eso es: aquí están <b>todas las apps que tienes abiertas</b>, como tarjetas.',
      tasks: [{
        scene: 'browser', setup: free(function (p) { p.preload(['notas', 'fotos']); }), hint: recHint, show: recShow, wrong: recWrong, goal: function (ev) { return ev.type === 'recents'; },
        say: 'Aunque no lo veas, tienes <b>varias apps abiertas</b>. Para verlas todas: ' + recHow + '.'
      }]
    });
    m4.push({
      title: 'Cambiar de una app a otra', ok: 'Así se salta de una app a otra <b>sin perder lo que estabas haciendo</b>.',
      tasks: [
        {
          scene: 'browser', setup: recents(['notas', 'fotos']), hint: '.rc[data-id="notas"]', goal: function (ev) { return ev.type === 'appOpen' && ev.app === 'notas'; },
          wrong: function (ev) { return ev.type === 'appOpen' && ev.app !== 'notas' ? 'Esa es otra app. Busca la tarjeta que dice <b>Notas</b>.' : null; },
          say: 'Cada tarjeta es una app abierta. Para <b>cambiar</b> a una, <b>toca su tarjeta</b>. Toca la de <mark>Notas</mark>.'
        },
        {
          hint: function (p) { return p.fg === 'recents' ? '.rc[data-id="fotos"]' : recHint; }, show: recShow, wrong: recWrong,
          goal: function (ev) { return ev.type === 'appOpen' && ev.app === 'fotos'; },
          say: 'Estás en Notas. Ahora salta a <mark>Fotos</mark>: abre otra vez las apps abiertas (' + recHow + ') y toca su tarjeta. <small>Si no la ves, <b>desliza las tarjetas hacia un lado</b>.</small>'
        }
      ]
    });
    m4.push({
      title: 'Cerrar una app', ok: 'Cerrar apps que no usas ayuda a que el móvil vaya más ligero. Es como <b>tirar una tarjeta a la papelera</b>.',
      tasks: [{
        scene: 'browser', setup: recents(['notas', 'fotos']), hint: '.rc[data-id="fotos"]', show: function (p) { return p.demoSwipe('card-up', p.q('.rc[data-id="fotos"]')); },
        goal: function (ev) { return ev.type === 'closeApp' && ev.app === 'fotos'; },
        wrong: function (ev) { return ev.type === 'closeApp' && ev.app !== 'fotos' ? 'Has cerrado otra, no pasa nada. Ahora cierra la de <b>Fotos</b>.' : null; },
        say: 'Para <b>cerrar</b> una app, pon el dedo sobre su tarjeta y <b>deslízala hacia arriba</b> hasta que desaparezca. Cierra la de <mark>Fotos</mark>.<br><small>(Con el ratón: arrastra la tarjeta hacia arriba.)</small>'
      }]
    });
    m4.push({
      title: 'Cerrar todas las apps', ok: 'Ya no queda ninguna abierta. Cuando el móvil vaya lento, <b>cerrar apps</b> suele ayudar.',
      tasks: [{
        scene: 'browser', setup: recents(['notas', 'fotos']), hint: A ? '.rc-clear' : '.rc', show: A ? null : function (p) { return p.demoSwipe('card-up', p.q('.rc')); },
        goal: function (ev) { return ev.type === 'closeAll'; },
        say: A ? 'Si quieres cerrar <b>todas</b> de una vez, pulsa <mark>Borrar todo</mark> (abajo, debajo de las tarjetas).' : 'Cierra todas las apps que quedan: <b>desliza cada tarjeta hacia arriba</b>, una por una.'
      }]
    });
    if (A) {
      m4.push({
        title: 'Navegar con gestos', ok: 'Si tu móvil no tiene botones, ya sabes: <b>borde = atrás</b>, <b>rayita arriba = inicio</b>, <b>rayita arriba y esperar = apps abiertas</b>, <b>rayita de lado = cambiar de app</b>.',
        tasks: [
          {
            scene: 'settings', setup: free(function (p) { p.setNav('gestures'); p.preload(['notas']); }), hint: '[data-title="Pantalla"]', goal: function (ev) { return ev.type === 'go'; },
            say: 'Muchos móviles <b>no tienen botones</b> abajo, solo una <b>rayita</b>. Mira: ya no están ◀ ● ▢. Se maneja con los dedos. Empieza tocando <mark>Pantalla</mark>.'
          },
          {
            hint: '.p-screen', show: function (p) { return p.demoSwipe('edge-back'); }, goal: function (ev) { return ev.type === 'gesture' && ev.kind === 'back'; },
            say: '<b>Atrás</b> con gestos: pon el dedo en el <b>borde</b> izquierdo o derecho de la pantalla y arrástralo <b>hacia el centro</b>.'
          },
          {
            hint: '.home-ind', show: function (p) { return p.demoSwipe('home-up'); }, goal: function (ev) { return ev.type === 'gesture' && ev.kind === 'home'; },
            say: '<b>Inicio</b> con gestos: pon el dedo en la <b>rayita</b> de abajo y desliza <b>hacia arriba</b>, rápido.'
          },
          {
            hint: '.home-ind', show: function (p) { return p.demoSwipe('recents-up'); }, goal: function (ev) { return ev.type === 'gesture' && ev.kind === 'recents'; },
            wrong: function (ev) { return ev.type === 'gesture' && ev.kind === 'home' ? 'Has soltado demasiado pronto y te ha llevado al inicio. Sube y <b>espera un segundo</b> antes de soltar.' : null; },
            say: '<b>Apps abiertas</b> con gestos: desliza desde la rayita hacia arriba pero, a mitad de pantalla, <b>espera un segundo sin soltar</b>.'
          },
          {
            setup: function (p) { p.hideRecentsQuiet(); p.openApp('ajustes', 'home'); }, hint: '.home-ind', show: function (p) { return p.demoSwipe('bar-right'); },
            goal: function (ev) { return ev.type === 'appOpen' && ev.via === 'bar'; },
            say: '<b>Cambiar rápido</b> a la app anterior: pon el dedo en la rayita y deslízalo <b>hacia la derecha</b>.'
          }
        ]
      });
    } else if (!BTN) {
      m4.push({
        title: 'Cambiar de app con la rayita', ok: 'Un truco muy cómodo: la <b>rayita</b> sirve para volver a la app anterior sin abrir nada.',
        tasks: [{
          scene: 'browser', setup: free(function (p) { p.preload(['notas']); }), hint: '.home-ind', show: function (p) { return p.demoSwipe('bar-right'); },
          goal: function (ev) { return ev.type === 'appOpen' && ev.via === 'bar'; },
          say: 'Para saltar a la <b>app anterior</b> sin abrir nada más, pon el dedo en la rayita de abajo y deslízalo <b>hacia la derecha</b>.'
        }]
      });
    }

    /* --- organizar las apps del inicio --- */
    var holdHow = A ? 'Mantén el dedo sobre el icono hasta que se levante (verás un <b>círculo naranja</b> que se llena)' : 'Mantén el dedo sobre el icono hasta que se levante (verás un <b>círculo naranja</b> que se llena y luego los iconos <b>temblarán</b>)';
    m4.push({
      title: 'Mover una app de sitio', ok: 'Eso es: <b>mantener pulsado y arrastrar</b>. Así pones las apps donde mejor te vengan.',
      tasks: [{
        scene: 'home', setup: free(function (p) { p.glow = 'fotos'; p.renderHome(); }), hint: '[data-app="fotos"]',
        show: function (p) { return p.demoSwipe('dragto', p.q('.hm-grid [data-app="fotos"]'), p.q('[data-slot="17"]')); },
        goal: function (ev) { return ev.type === 'move' && ev.app === 'fotos'; },
        say: holdHow + ' en <mark>Fotos</mark> y, <b>sin soltar</b>, arrástralo a un hueco vacío de más abajo. Entonces suelta.' + (A ? '<br><small>(Al levantarlo sale un menú pequeño: no lo toques, sigue arrastrando.)</small>' : '')
      }]
    });
    m4.push({
      title: 'Crear una carpeta', ok: 'Carpeta creada. Sirve para <b>juntar apps parecidas</b> y tener el inicio ordenado.',
      tasks: [{
        scene: 'home', setup: free(function (p) { p.glow = 'notas'; p.renderHome(); }), hint: '[data-app="notas"]',
        show: function (p) { return p.demoSwipe('dragto', p.q('.hm-grid [data-app="notas"]'), p.q('.hm-grid [data-app="reloj"]')); },
        goal: function (ev) { return ev.type === 'folder' && ev.apps.indexOf('notas') >= 0 && ev.apps.indexOf('reloj') >= 0; },
        say: 'Para crear una <b>carpeta</b>, coge una app y suéltala <b>encima de otra</b>. ' + holdHow + ' en <mark>Notas</mark>, arrástrala sobre <mark>Reloj</mark> y suelta.'
      }]
    });
    m4.push({
      title: 'Ponerle nombre a la carpeta', ok: 'La carpeta ya se llama <b>Familia</b>. Cuando quieras cambiarlo, repite lo mismo.',
      tasks: [
        { scene: 'home', setup: free(function (p) { mkFolder(p, A ? '' : 'Utilidades', ['reloj', 'notas'], 4); }), hint: '[data-folder]', goal: function (ev) { return ev.type === 'folderOpen'; }, say: 'Aquí tienes la carpeta con dos apps. <b>Tócala</b> para abrirla.' },
        { hint: '.fd-t', goal: function (ev) { return ev.type === 'focus' && ev.id === 'fname'; }, say: 'Para cambiarle el nombre, toca el <b>nombre de arriba</b> (el que lleva el lápiz).' },
        {
          type: { field: 'fname', target: 'Familia', demo: false, assist: true }, hint: '[data-fid="fname"]',
          say: 'Escribe <mark>Familia</mark>.' + (I ? ' Antes borra «Utilidades» con ' + BACK + ': si dejas el dedo pulsado, borra más rápido.' : '')
        },
        {
          hint: '.p-fold', goal: function (ev) { return ev.type === 'folderClose'; },
          say: 'Pulsa ' + (A ? '<b>✓</b> en el teclado' : '<b>OK</b> en el teclado') + ' para guardar el nombre y luego <b>toca fuera</b> de la carpeta (en la zona oscura) para cerrarla.'
        }
      ]
    });
    m4.push({
      title: 'Meter otra app en la carpeta', ok: 'Perfecto. Ya tienes <b>tres apps</b> dentro de «Familia».',
      tasks: [{
        scene: 'home', setup: free(function (p) { mkFolder(p, 'Familia', ['reloj', 'notas'], 4); p.glow = 'correo'; p.renderHome(); }), hint: '[data-app="correo"]',
        show: function (p) { return p.demoSwipe('dragto', p.q('.hm-grid [data-app="correo"]'), p.q('.hm-grid [data-folder]')); },
        goal: function (ev) { return ev.type === 'folderAdd' && ev.app === 'correo'; },
        say: 'Para <b>añadir</b> otra app a la carpeta, suéltala <b>encima de la carpeta</b>. Mueve <mark>Correo</mark> hasta «Familia».'
      }]
    });
    m4.push({
      title: A ? 'Desinstalar una app' : 'Eliminar una app', ok: 'La app ya no está en el móvil. <b>Si te arrepientes</b>, se puede volver a descargar de la tienda de aplicaciones.',
      tasks: [{
        scene: 'home', setup: free(function (p) { p.glow = 'solitario'; p.renderHome(); }), hint: '[data-app="solitario"]',
        show: function (p) { return p.demoSwipe('hold', p.q('.hm-grid [data-app="solitario"]')); },
        goal: function (ev) { return ev.type === 'uninstall' && ev.app === 'solitario'; },
        say: A ? 'Vamos a <b>desinstalar</b> el juego del <mark>Solitario</mark>, que ya no usas. Mantén el dedo sobre su icono: sale un menú. Pulsa <b>Desinstalar</b> y luego <b>Aceptar</b>.<br><small>(También puedes levantarlo y arrastrarlo hasta «Desinstalar», arriba.)</small>'
          : 'Vamos a <b>eliminar</b> el juego del <mark>Solitario</mark>, que ya no usas. Mantén el dedo sobre su icono: sale un menú. Toca <b>Quitar app</b>, luego <b>Eliminar app</b> y por último <b>Eliminar</b>.<br><small>(«Quitar del inicio» solo esconde el icono; la app seguiría instalada.)</small>'
      }]
    });
    m4.push({
      title: 'Reto: ordena tu móvil', ok: 'Tu inicio está ordenado. Ya sabes <b>moverte por el móvil</b> y <b>organizarlo</b> a tu gusto.',
      tasks: [
        {
          scene: 'home', setup: free(function (p) { p.glow = 'radio'; p.renderHome(); }), hint: '[data-app="radio"]', goal: function (ev) { return ev.type === 'uninstall' && ev.app === 'radio'; },
          say: 'Reto 1 de 2 · Ya no escuchas la <mark>Radio</mark>: ' + (A ? 'desinstálala.' : 'elimínala.')
        },
        {
          hint: '[data-app="mapas"]', goal: function (ev) { return ev.type === 'folder' && ev.apps.indexOf('mapas') >= 0 && ev.apps.indexOf('tiempo') >= 0; },
          say: 'Reto 2 de 2 · Junta <mark>Mapas</mark> y <mark>El tiempo</mark> en una carpeta.'
        }
      ]
    });
    M.push({ id: 4, icon: 'grid', title: 'Moverte y organizar apps', desc: 'Atrás, inicio, apps abiertas (ver, cambiar y cerrar), gestos; mover apps, crear carpetas, ponerles nombre y desinstalar.', steps: m4 });

    /* ============ MÓDULO 5: copiar y pegar ============ */
    var m5 = [];
    var TOL = function (p) { return Array.prototype.find.call(p.root.querySelectorAll('.bub .w'), function (w) { return /Toledo/.test(w.textContent); }); };
    var ADDR = 'Mi dirección nueva es Calle Real 25, Toledo. Llámame al 600 111 222.';
    m5.push({
      title: 'Elegir una palabra', ok: 'Eso es: <b>mantener el dedo pulsado</b> sobre una palabra la selecciona. Aparecen dos <b>tiradores</b> azules y una barra de botones.',
      tasks: [{
        scene: 'chat', cfg: { msgs: [ADDR] }, hint: '.bub .seltxt', show: function (p) { return p.demoSwipe('hold', TOL(p)); },
        goal: function (ev) { return ev.type === 'select' && /Toledo/.test(ev.text); },
        say: 'Marta te ha mandado su dirección. Para <b>copiar texto</b>, primero hay que <b>elegirlo</b>: mantén el dedo <b>pulsado</b> sobre una palabra (verás un círculo naranja que se llena). Hazlo sobre <mark>Toledo</mark>.<br><small>(Con el ratón: deja el botón pulsado un momento.)</small>'
      }]
    });
    m5.push({
      title: 'Elegir la dirección y copiarla', ok: 'Ya está <b>copiada</b>. El móvil la guarda en una «memoria» hasta que la pegues en otro sitio.',
      tasks: [
        {
          scene: 'chat', cfg: { msgs: [ADDR] }, hint: '.bub .seltxt',
          show: function (p) { var w = Array.prototype.find.call(p.root.querySelectorAll('.bub .w'), function (x) { return /Calle/.test(x.textContent); }); return p.demoSwipe('hold', w); },
          goal: function (ev) { return ev.type === 'select' && /^Calle Real 25, Toledo\.?$/.test(ev.text); },
          wrong: function (ev) { return ev.type === 'select' && /Llámame|600/.test(ev.text) ? 'Has elegido de más. Arrastra el <b>tirador azul del final</b> hacia atrás hasta «Toledo».' : (ev.type === 'select' && /^Toledo$|^Calle$/.test(ev.text) ? 'Casi. Ahora <b>arrastra el tirador azul</b> para elegir también el resto: de «Calle» a «Toledo».' : null); },
          say: 'Ahora elige <b>toda la dirección</b>: mantén pulsado sobre <mark>Calle</mark> y arrastra el <b>tirador azul del final</b> hasta <mark>Toledo.</mark>'
        },
        { hint: '[data-sa="copy"]', goal: function (ev) { return ev.type === 'copy'; }, say: 'En la barra negra que ha salido, toca <mark>Copiar</mark>.' }
      ]
    });
    m5.push({
      title: 'Pegar en otra app', ok: 'Pegado. Copiar en una app y <b>pegar en otra</b> sirve para direcciones, teléfonos, recetas…',
      tasks: [
        {
          scene: 'chat', cfg: { msgs: [ADDR] }, setup: free(function (p) { p.clip = { type: 'text', text: 'Calle Real 25, Toledo.' }; }),
          hint: A ? '.nb-home' : (BTN ? '.p-hw' : '.home-ind'), show: (!A && !BTN) ? function (p) { return p.demoSwipe('home-up'); } : null, goal: function (ev) { return ev.type === 'home'; },
          say: 'La dirección ya está copiada. Ahora hay que ir a <b>otra app</b>: ve al inicio (' + homeHow + ').'
        },
        {
          setup: function (p) { p.glow = 'notas'; p.renderHome(); }, hint: '[data-app="notas"]', goal: function (ev) { return ev.type === 'appOpen' && ev.app === 'notas'; },
          say: 'Abre <b>Notas</b> 📝 para guardar la dirección.'
        },
        { hint: '[data-fid="note"]', goal: function (ev) { return ev.type === 'focus' && ev.id === 'note'; }, say: 'Toca el cuadro de la nota para empezar a escribir.' },
        {
          hint: '[data-fid="note"]', goal: function (ev) { return ev.type === 'paste' && /Toledo/.test(ev.text || ''); },
          say: 'Para <b>pegar</b>: mantén el dedo pulsado sobre el cuadro y toca <mark>Pegar</mark>.' + (A ? '<br><small>(En Android también puedes tocar el 📋 que sale arriba del teclado.)</small>' : '')
        }
      ]
    });
    m5.push({
      title: 'Cortar y pegar', ok: '<b>Cortar</b> es como copiar, pero el texto <b>desaparece</b> de donde estaba. Útil para cambiar un texto de sitio.',
      tasks: [
        {
          scene: 'notes', cfg: { value: 'Tomar la pastilla a las 9' }, hint: '.field', goal: function (ev) { return ev.type === 'selectAll'; },
          show: function (p) { var w = Array.prototype.find.call(p.root.querySelectorAll('.field .w'), function (x) { return /pastilla/.test(x.textContent); }); return p.demoSwipe('hold', w); },
          say: 'En esta nota hay un texto. Mantén el dedo pulsado sobre <mark>pastilla</mark> y, en la barra, toca <mark>Seleccionar todo</mark>.'
        },
        { hint: '[data-sa="cut"]', goal: function (ev) { return ev.type === 'cut'; }, say: 'Ahora toca <mark>Cortar</mark>. Verás que el texto desaparece de la nota.' },
        { hint: '[data-fid="note"]', goal: function (ev) { return ev.type === 'paste'; }, say: 'Está en la memoria del móvil. Vuelve a ponerlo: mantén pulsado el cuadro vacío y toca <mark>Pegar</mark>.' }
      ]
    });
    m5.push({
      title: 'Copiar una foto', ok: 'Las <b>fotos</b> también se copian. Ahora hay que pegarla en un mensaje.',
      tasks: [{
        scene: 'gallery', hint: '.ph', show: function (p) { return p.demoSwipe('hold', p.q('.ph[data-img="f3"]')); },
        goal: function (ev) { return ev.type === 'copyImage'; },
        say: 'Para copiar una <b>foto</b>: mantén el dedo <b>pulsado</b> sobre ella y, en el menú que sale, toca <mark>' + T('Copiar', 'Copiar') + '</mark>.'
      }]
    });
    m5.push({
      title: 'Pegar la foto en un mensaje', ok: 'Foto enviada. Ya sabes <b>copiar y pegar texto y fotos</b> entre distintas apps.',
      tasks: [
        {
          scene: 'home', setup: free(function (p) { p.clip = { type: 'image', emoji: '🐶', color: '#fde68a' }; p.glow = A ? 'whatsapp' : 'mensajes'; p.renderHome(); }),
          hint: A ? '[data-app="whatsapp"]' : '[data-app="mensajes"]', goal: function (ev) { return ev.type === 'appOpen' && (ev.app === 'whatsapp' || ev.app === 'mensajes'); },
          say: 'Has copiado una foto del perrito. Vamos a mandársela a Marta: abre <b>' + T('WhatsApp', 'Mensajes') + '</b> (abajo, en la fila de iconos fijos).'
        },
        { hint: '[data-fid="msg"]', goal: function (ev) { return ev.type === 'paste' && ev.kind === 'image'; }, say: 'Mantén el dedo pulsado sobre el cuadro de escribir y toca <mark>Pegar</mark>.' + (A ? '<br><small>(O toca el 📋 de arriba del teclado.)</small>' : '') },
        { hint: '.sendb', goal: function (ev) { return ev.type === 'send' && ev.image; }, say: 'La foto está lista (se ve encima del cuadro). Toca el botón de <b>enviar</b> ➤.' }
      ]
    });
    m5.push({
      title: 'Reto: copia un teléfono de una web', ok: 'Has copiado un dato de una <b>página web</b> y lo has guardado en <b>otra app</b>. Eso es lo que más se usa en el día a día.',
      tasks: [
        {
          scene: 'web', hint: '.web .seltxt', goal: function (ev) { return ev.type === 'select' && /^600 111 222\.?$/.test(ev.text); },
          wrong: function (ev) { return ev.type === 'select' ? (/600/.test(ev.text) ? 'Ajusta los tiradores azules para que solo se elija el número <b>600 111 222</b>.' : 'Esa palabra no es. Busca el número de <b>Teléfono</b>.') : null; },
          say: 'Esta página dice cómo llamar al Ayuntamiento. <b>Elige el número de teléfono</b> (600 111 222): mantén pulsado sobre <mark>600</mark> y arrastra el tirador azul del final hasta el último <mark>222</mark>.'
        },
        { hint: '[data-sa="copy"]', goal: function (ev) { return ev.type === 'copy'; }, say: 'Toca <mark>Copiar</mark>.' },
        {
          setup: free(), hint: A ? '.nb-home' : (BTN ? '.p-hw' : '.home-ind'), goal: function (ev) { return ev.type === 'home'; },
          say: 'Ve al inicio (' + homeHow + ') y abre <b>Notas</b>.'
        },
        {
          setup: function (p) { p.glow = 'notas'; p.renderHome(); }, hint: '[data-app="notas"]', goal: function (ev) { return ev.type === 'appOpen' && ev.app === 'notas'; }, say: 'Abre <b>Notas</b> 📝.'
        },
        { hint: '[data-fid="note"]', goal: function (ev) { return ev.type === 'paste' && /600 111 222/.test(ev.text || ''); }, say: 'Toca el cuadro, mantén pulsado y toca <mark>Pegar</mark> para guardar el teléfono.' }
      ]
    });
    M.push({ id: 5, icon: 'clipboard', title: 'Copiar y pegar', desc: 'Elegir texto, copiar, cortar y pegar; copiar fotos y usarlas en otras apps.', steps: m5 });
    return M;
  };
})();
