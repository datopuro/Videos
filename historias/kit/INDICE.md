# Índice del kit de historias (leer esto, no el código)

Restaurar: `git clone --depth 1 https://github.com/datopuro/Videos /home/claude/repo && ln -sfn /home/claude/repo/historias/kit /home/claude/kit` · dependencias: `sh kit/instalar.sh`
Render: `python3 kit/render.py muestras|tramo|paralelo|codificar <carpeta> ...` · revisión: `revisa_auto.py <mp4>` (texto) y `revisa.py <mp4> <dir> <seg>` (hoja).
Carpeta de escena: `escena.html`, `formato.json` ({"ancho","alto","fps"}; vertical 1080×1920), `timeline.json`, `voz.f32` opcional (mueve bocas con `habla:true`).
Archivos JS: `caricatura.js` (base, fondos, efectos, personaje B) + `rig2.js` (animación v2, `personaje2`) + `rig3.js` (`personaje3`, el vigente). render.py los inyecta juntos en `__CARICATURA__`.
Ejemplos completos: `escenas/juliane_piloto.html` (v1.2) y `escenas/juliane_caida.html` (v2, la referencia actual).

## Esqueleto de escena.html
```html
<script>__CARICATURA__</script><script>
const D = __DATA__; C.datos(D); const g = C.lienzo();
const p = C.personaje2({...receta});  const lug = C.lugar({...receta_fondo});
window.renderAt = t => { g.limpiar(); const cam = C.encuadre(x, y, zoom);
  lug.fondo(g, cam, t); C.iluminar(g, gg => p.dibujar(gg, {t, x, y, cara, pose, mira}), {tinte, borde});
  lug.frente(g, cam, t); /* efectos, textos */ };
window.listo = true;</script>
```

## Funciones públicas
| Función | Qué hace |
|---|---|
| `C.personaje2(rec).dibujar(g,{t,x,y,escala,cara,pose,mira:[x,y],manoI,manoD,pelo,falda,lentes,descalzo,habla,sombra})` | Personaje estilo B (el aprobado). Pose libre `{sentado,suelo,tor,cab,hombros,dx,dy,bi,bd,pi,pd}` |
| `C.personajeB(rec)` | Estilo B v1.2 con poses de catálogo `C.POSES_B` (más simple) |
| `C.cara2(nombre|obj)`, `C.mezclarCara2(a,b,k)` | Caras `C.CARAS2`: neutral feliz tranquila miedo terror apretada sorpresa dolor triste dormida; campos cej cejI cejD cejY ojoH plato boca ab rubor sucio |
| `C.pista(t,[[t0,v],[t1,v,'sal'],...])` | Animación por claves (números o vectores); curvas suave sal ent reb lin |
| `C.resorte(fn,t,{t0,f,z})` | Sigue a `fn(t)` con retraso y rebote (pelo, ropa, cámara) |
| `C.ruido(t,s)`, `C.dardos(t,s,per)`, `C.hash(n)` | Ruido suave; saltos rápidos (miradas); aleatorio fijo |
| `C.ik2(a,b,l1,l2,elige)` | Codo/rodilla para que mano/pie llegue a un punto |
| `C.iluminar(g,fn,{tinte,borde,off,bordeK})` | Tinte de escena + luz de contorno sobre lo que dibuje `fn` |
| `C.cache(w,h,fn)` | Dibuja algo grande una vez (canvas reutilizable) |
| `C.lugar(rec).fondo(g,cam,t)` / `.frente(g,cam,t)` | Fondo por capas cielo/lejos/fondo/medio/frente con paralaje |
| `C.encuadre(x,y,zoom)`, `C.camLerp(a,b,u)`, `cam.temblor`, `cam.rot` | Cámara |
| `C.gradacion(g,arriba,abajo,k)`, `C.rayos`, `C.lluvia`, `C.niebla`, `C.relampago(g,t,t0)`, `C.grano`, `C.vineta`, `C.fundido` | Luz y ambiente |
| `C.rotulo`, `C.cartel(g,titulo,sub,a)`, `C.globo(g,txt,x,y,a)`, `C.subTemp`, `C.dividida` | Textos |
| `C.asientoFrente`, `C.brazosAsiento`, `C.cinturonFrente`, `C.rr` | Objetos sueltos |
| `C.ventana(t,t0,t1,d)`, `C.suave`, `C.salida`, `C.rebote`, `C.lerp`, `C.clamp` | Utilidades de tiempo |

Módulos de fondo (`mod`): cielo sol nubes ciudad_lejana edificios calle pared piso ventana puerta estante mostrador letrero lampara arbol colinas rect · dosel selva_lejos selva_troncos suelo_selva helecho hoja_grande dosel_abajo · avion_interior cabina.

## Recetas
Personaje (`personajes/*.json`): `{id, cuerpo:{complexion,estatura,cabeza,ojos}, piel, pelo:{estilo:largo|corto|coleta|calvo,color}, ropa:{arriba:{tipo,color}, abajo:{tipo,color}, pies:{color,descalzo:'i'|'d'|'ambos'}}}`.
Fondo (`fondos/*.json`): `{id, hora, capas:{cielo|lejos|fondo|medio|frente:[{mod, ...parámetros}]}}` → `C.lugar(rec)`.

## Si necesito X, uso Y
| Necesito | Uso |
|---|---|
| Expresión que cambia | `C.mezclarCara2(a,b,C.suave((t-t0)/0.4))`; golpe: `C.rebote` |
| Movimiento con anticipación | `C.pista` con curvas `reb`/`sal` |
| Pelo/vestido con viento | `pelo:[dx,dy]`, `falda:[dx,dy]` + `C.resorte` |
| Mano que agarra algo | `manoI`/`manoD` en coordenadas del personaje |
| Personaje integrado a la luz | envolver `dibujar` en `C.iluminar` |
| Fondo enorme que gira | `C.cache` + `drawImage` |
| Susto | `cam.temblor` + `C.relampago` + `plato:1` |
| Sonido real (papel, puerta, pasos) | `python3 /home/claude/repo/comun/sonidos.py buscar puerta` → `copiar <carpeta> id` → `m.archivo('sonidos/<id>.ogg', amp)` en `mezcla.py`. 890 sonidos sin internet; ver `comun/LEEME.md`. `sfx_buscar.py` (Freesound) solo en la laptop |
| Transición tinta o puertas | `dato-puro/kit/mod/transiciones.js` (tipos `tinta`, `puertas`, `papel`…): copiar con `cp`, probar |
| Íconos (5 963, Tabler) | `<script>__MOD:iconos__</script>` + `K.ico(g, 'nombre', x, y, tam)`; buscar con `comun/iconos.py buscar <palabra>` |
| Cosas que caen, rebotan o se apilan | `__MOD:fisica__` (matter-js precalculado), ver `comun/LEEME.md` |
| Rebote o resorte en un movimiento | `K.easeBack(u)`, `K.resorte(u)`, `K.escalon(u, n)` |
| Medir ritmo de cámara y color de un video | `python3 /home/claude/repo/comun/medir_movimiento.py video.mp4 carpeta` (necesita opencv-python-headless) |
| Desenfoque de fondo y color de cine (si un día se usa 3D) | `__MOD:look3d__` (ver `comun/LEEME.md`) |
| Música original (orquesta CC0) | `comun/musica/fondo.py` (ver `comun/LEEME.md`) |
| Que los letreros se alcancen a leer | `python3 /home/claude/repo/comun/lectura.py /home/claude/kit <carpeta>` antes del render |
| Un estilo nuevo (sombras chinescas, papel recortado, acuarela, anime 80s…) | galería lemo-opuscar: ver nota al final |
| Diálogo con boca | `habla` (número 0..1 o `C.rms(t)` si hay voz.f32); la narración NO mueve bocas |

Límites: el personaje solo existe de frente (no perfil ni espalda); manos sin dedos.

Módulos comunes (`iconos`, `datos`, `fisica`, `circuito`): antes, una vez por chat, `bash /home/claude/repo/comun/instalar.sh`; se cargan con `<script>__MOD:nombre__</script>`. Detalle solo si se usan: `comun/LEEME.md`.

Estudio de estilo y lecciones de un canal de historias animadas medido cuadro por cuadro: `referencias/BIBLIA_DE_ESTILO.md` (fórmula de guion, ritmo de voz, cámara, color) y `referencias/LECCIONES_SHORTS_ANIMADOS.md` (valores y trampas). Leer al planear el estilo del canal o cuando un video se vea "de día de campo".

## Personaje v3 (`rig3.js`, desde el 16 nov 2026): usar `C.personaje3` en todo video nuevo
Misma receta y mismas opciones que `C.personaje2` (que se conserva para los videos ya publicados). `C.historia` ya crea los personajes con v3 (`v: 2` en la receta fuerza el anterior).
- Trae: cuello, cabeza más chica, manos con pulgar, codos y rodillas redondeados, sombra propia, sombra de piso, línea de grosor parejo con cualquier acercamiento, parpadeo irregular, respiración y detalles de ropa (cuello, botones, bolsa, suela).
- `giro`: −1 perfil izquierdo, ±0.5 tres cuartos, 0 frente, 1 perfil derecho. Dos personajes que platican: `giro: 0.4` y `giro: -0.4`. El tres cuartos es lo que mejor se ve; el perfil completo es aproximado.
- `C.caminar(t, {dir, ritmo, amp})` devuelve la pose de caminata: `p.dibujar(g, {t, x, y, giro: dir, pose: C.caminar(t, {dir})})`.
- `sombra: false` cuando no está parado en el piso (salto, caída, nadando). Dentro de un objeto de utilería se quita sola.
- `vivo: false` quita los micro movimientos de ojos; `sinParpadeo: true` el parpadeo.
- Extras de receta: `bigote: '#color'`, `gorra: '#color'`, `gorraVisera`, pelo `rizado` y `afro`, `cuerpo.edad: 'nino'`.
- Ver todo: `python3 kit/render.py muestras kit/escenas/demo_personaje3 0.5 2.5 4.5 6.5`.
- Planos: el personaje se luce en plano medio y primer plano (escala 1.5 a 2.2). Evitar personajes de menos de 25 % del alto del cuadro salvo en tomas de lugar.

## Utilería: objetos terminados, ocupantes que no se salen y colores fijos (`<script>__MOD:utileria__</script>` después de `__CARICATURA__`)
Regla del canal (16 nov 2026, del usuario): nada de figuras sueltas "intentando ser algo". Todo objeto que salga en una historia viene de la utilería; si falta, se agrega a `mod/utileria.js` con el mismo acabado (sombra propia, brillo, contorno, sombra de piso) y se prueba en `escenas/demo_utileria` antes de usarlo.
- `const H = C.historia({personajes:{ana:{...receta}}, objetos:{sofa:{tipo:'sillon', plazas:2, color:'#b5523b'}}})` una sola vez por video. `H.per('ana')`, `H.obj('sofa')`. El color y el tamaño viven ahí: pasarlos al dibujar da error, así un objeto no cambia entre escenas.
- `H.obj('bote').dibujar(g, {x, y, escala, rot, t, espejo, dentro:[(gg, a) => H.per('ana').dibujar(gg, {t, x:a.x, y:a.y, escala:a.escala, pose:{sentado:true}}), …]})`: dibuja atrás → ocupantes recortados al interior → frente. Los pies no pueden asomar bajo la borda ni fuera de las ventanas.
- Tipos (19): sillon, silla, banca, asiento_avion, escritorio, cama, mesa, lampara, planta, puerta, ventana, tienda, fogata, bote, velero, coche, avion, arbol, roca. Verlos todos: `python3 kit/render.py muestras kit/escenas/catalogo_utileria 1.0`.
- **Para agregar uno nuevo, leer `kit/UTILERIA.md`** (pasos, plantilla, medidas del personaje y lista de revisión). El catálogo corre `C.probarUtileria`, que falla si un objeto queda mal armado.
- Piezas propias con el mismo acabado: `C.forma(g, camino, color, {sombra, brillo, lw, dentro})` con `C.caminos.rr/poli/elip`; `C.sombraContacto(g, x, ancho)`. Dirección de luz global: `C.LUZ`.

## Lugares: fondos terminados con hora del día y luz (`<script>__MOD:fondos__</script>` después del de utilería)
Regla (16 nov 2026): el fondo de toda toma nueva sale de `C.lugar`; los fondos viejos de `caricatura.js` quedan solo para los tres videos ya hechos.
- `const L = C.lugar('calle', {hora:'noche'})` una vez por lugar de la historia (fuera de `renderAt`). Horas: `dia`, `tarde`, `noche`, `nublado`.
- Orden fijo en cada cuadro: `L.dibujar(g,{t,x})` → objetos y personajes con los pies en `y >= L.piso` → `L.frente(g,{t,x})` → `L.luz(g,{t,x,focos})`. `x` es el desplazamiento de cámara en píxeles (lo lejano se mueve menos). Los rótulos y subtítulos van después de `L.luz`, para que no se tiñan.
- `focos:[{x, y, r, fuerza}]` son luces locales (fogata, lámpara): sin ellas, de noche el personaje queda azulado junto al fuego.
- Lugares (6): `campo` {flores, camino, pasto}, `bosque` {clase:'abedul'|'pino', frente:false quita los troncos de primer plano}, `calle` {colores}, `interior` {pared, suelo:'madera'|'loseta', tapiz:'rayas'|'puntos'|'madera', ventanaX, alfombra, friso}, `mar` {playa, isla, horizonte, agua, arena}, `nieve` {nevando, hielo}.
- Verlos todos: `python3 kit/render.py muestras kit/escenas/demo_fondos 0.7 2.2 3.7 5.2 6.7 8.2 9.7 11.2`. La escena corre `C.probarLugares`, que falla si un lugar deja el lienzo cambiado o truena con alguna hora.
- **Para agregar un lugar nuevo, leer la sección "Lugares" de `kit/UTILERIA.md`.**

## Voz: tiempos, boca y subtítulos sacados del audio (`<script>__MOD:voz__</script>` después de los otros módulos)
Regla (16 nov 2026): ningún tiempo se teclea a mano y ningún subtítulo se escribe dentro de la escena. Todo sale de la voz.
- Carpeta del video: `bloques.json` (`{"tempo":1.0, "voz":"voz_original.mp3", "sub_car":40, "bloques":[["frase 1","frase 2"],["frase 3"]]}`, solo el texto del guion) y el mp3.
- `python3 kit/alinear.py carpeta` → escucha el mp3 y escribe `alineacion.json` con el tiempo de cada palabra (no hace falta el JSON de ElevenLabs). Imprime las diferencias entre guion y voz: si la coincidencia baja de 85 % el audio no es el del guion. Precisión medida: ±0.1 s por palabra.
- `python3 kit/prep.py carpeta` → `timeline.json` y `voz.f32`. Debe terminar en "tiempos de alinear.py".
- En la escena: `C.cuando('texto tal cual del guion')` da el segundo en que se dice (opciones `{fin:true, vez:2, mas:0.2}`); si la voz no lo dice, da error. Las entradas de tomas, rótulos y gestos se definen así, nunca con números.
- Boca: `habla: C.bocaVoz(t)` (sigue el volumen real) o `habla: C.hablaEn(t, 'frase que dice ese personaje')` para que solo abra la boca en su frase. Un narrador que no aparece no mueve la boca de nadie.
- `C.subtitulos(g, t)` al final del cuadro (después de `L.luz`): parte en dos renglones por ancho real, tamaño según formato (horizontal 5.2 % del alto, vertical 6 % del ancho), fuente del kit. `{resalta:'#ffd54a'}` pinta la palabra que se está diciendo. No usar `C.subTemp` ni globos que repitan lo que ya dice el subtítulo.
- Fuente: Poppins va dentro del kit (`kit/fuentes/`) y `render.py` la mete en la página; todo texto usa `C.FUENTE` y se ve igual en la nube y en Windows.
- Destellos: solo con `C.destello(g, t, t0)` (sube y baja en rampa, tope 0.6). Prohibido alternar claro/oscuro cuadro por cuadro (`Math.sin(t*90)` y similares).
- Muestra: `kit/escenas/demo_voz` (el mp3 no está en el repo; sin él se ven los subtítulos pero no la boca).

## Acabado de cine (25 nov 2026): desenfoque de movimiento, color final, destello en cortes, acercamiento parejo, animación "a dos"
Ver `comun/LEEME.md`, sección "Acabado de cine". Resumen: `window.DESENFOQUE` en la escena, `"color"` en `formato.json`, `<script>__MOD:efectos__</script>` para `C.luzFuga`, `C.zoomParejo` y `C.posterizar(t, 12)` (personajes a 12 cuadros por segundo, cámara a 24).

## Notas de rig (de la guía técnica de lemo-opuscar, en nuestras palabras)
- Brazo levantado: girar primero hacia afuera y luego hacia adelante; al revés, los brazos se cruzan en X.
- Al subir el brazo, el hombro también sube y se adelanta un poco.
- No delinear la parte del brazo que queda encima del torso: esa línea hace que la articulación parezca costura de títere.
- Estilos de stop motion o cel: dibujar personajes "en dos" (12 por segundo), pero la cámara y la luz a 24/30 fps; una cámara a saltos parece lag.

## Galería de estilos externa (lemo-opuscar, 99 estilos)
Solo cuando se busque un estilo nuevo. Bajar únicamente ese estilo:
`git clone -q --depth 1 --filter=blob:none --sparse https://github.com/lemomo-ai/lemo-opuscar /tmp/lemo && git -C /tmp/lemo sparse-checkout set styles/<slug>`
Para historias: `shadow-puppet`, `papercut-red`, `paper-popup`, `cel-anime-80s`, `rubber-hose`, `ukiyoe`, `watercolor`, `crayon-book`, `silent-film`, `manga-panels`, `stained-glass`, `colored-pencil`, `scifi-toon`, `midcentury-toon`, `isometric-picture-book`. Ver primero `poster.jpg` y `style.json`; leer `STYLE.md` solo si convence. El código de `demo/` es MIT (se puede adaptar dando crédito); los `.md` son CC BY-NC: se leen para aprender, no se copian al repo. Sus demos son horizontales (1920×1080).
