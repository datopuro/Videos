# comun/: herramientas que usan los dos canales

Ningún chat las lee enteras: se usan con los comandos de abajo. Están en el repo que ya se clona para restaurar el kit (`/home/claude/repo/comun/`; en la laptop, la carpeta `comun` del repo clonado).

## Módulos de animación (`comun/mod/`)
Se cargan en `escena.html` con `<script>__MOD:nombre__</script>` en los dos kits (render.py busca primero `kit/mod/` y luego `comun/mod/`). Antes, una vez por chat: `bash /home/claude/repo/comun/instalar.sh` (en Dato Puro lo corre ya `kit/instalar.sh`). En la laptop: clonar el repo en `C:\dato-puro\repo` y correr ahí `bash comun/instalar.sh`, o poner la variable `KIT_COMUN` con la ruta de `comun/mod`. Demo de todo: `comun/galeria/demo` (hoja en `m/hoja.jpg`).

- **`iconos`** — 5 963 íconos Tabler (MIT): `K.ico(g, 'car', x, y, tam, {color, grosor, u, modo:'aparecer'|'trazar', rot, a})`; `'-f'` al final = relleno. Buscar nombres: `python3 /home/claude/repo/comun/iconos.py buscar battery` (en inglés). Si el nombre no existe, el error sugiere parecidos.
- **`datos`** — D3 completo (`window.d3`) + gráficas que no tiene `graficas.js`: `const DG = K.d3graf(OV, 'oscuro'|'papel')`; `DG.sankey(nodos, enlaces, x, y, w, h, u, {suf})` (flujos: a dónde se va la luz, el dinero, el agua), `DG.treemap(datos, …)` (partes de un total por área), `DG.burbujas(datos, …)`, `DG.area(series, …, {apilada})`, `DG.red(nodos, enlaces, …)` (grafo con íconos; acomodo de fuerzas calculado una vez, siempre igual). `datos = [{e, v, destacar, color}]`, `nodos = [{id, e, icono}]`, `enlaces = [{de, a, v}]`. Todo recibe `u` de 0 a 1.
- **`fisica`** — matter-js (MIT) precalculado: `const F = K.fisica((M, mundo, en) => { …M.Bodies…; M.Composite.add(mundo, …); en(1.2, fn) }, {dur})` y en `renderAt`: `F.dibujar(g, t)` o `F.cuerpos(t)` para dibujar a mano. Estilo por cuerpo: `cuerpo.plugin.dp = {color, icono, etiqueta, oculto}`. `F.choques` lista `{t, a, b, v}` para poner golpes en `mezcla.py`. La simulación entera se calcula al cargar: mismo resultado en cualquier cuadro y en paralelo. Coordenadas en píxeles, `y` hacia abajo.
- **`circuito`** — esquema eléctrico con simulación real (análisis nodal, transitorio): `const CI = K.circuito({nodos:{tierra:[x,y], a:[x,y]…}, partes:[{tipo, de, a, …}]}, {dur})` y `CI.dibujar(g, t, {tema, resaltar:[i], solo:[i], puntos, voltaje})`. Tipos: `bateria` (v; de = −, a = +), `fuente`, `fuente_i`, `resistencia` (r), `foco` (r, brilla con la potencia), `motor` (r), `led`/`diodo` (vf, color; de = ánodo), `capacitor` (c), `inductor` (l), `interruptor` (cerrado: valor o `t => …`), `amperimetro`, `cable`. Cualquier valor puede ser función de `t`. `ruta:[[x,y]…]` para doblar; `e` etiqueta, `mostrar:'i'|'v'|'p'` lectura en vivo, `lado:-1` la pasa al otro lado. Los puntos avanzan según la corriente calculada y los cables se colorean por voltaje (verde +, gris 0, rojo −). `CI.v('nodo', t)`, `CI.i(k, t)`, `CI.unidad(x, 'V')`. Las cifras que salgan en pantalla son del modelo ideal: rotular "simulación" o "esquema simplificado" si el video afirma valores reales.
- **`look3d`** — acabado de cámara para escenas 3D hechas con `K.tres` (Dato Puro): `const L = K.look3d({dof:true, color:'dia'|'dorado'|'neutro'|null})` y en `renderAt`: `L.enfoque(distancia_m, px)` (desenfoque por profundidad real: 12–16 px primeros planos, 0 tomas abiertas) y `L.colorear('dia', 'dorado', t)` para pasar de un color a otro. El color va después de todo el 3D y no toca la capa 2D (`K.capa2D`) ni los subtítulos. Probado sobre la demo de objetos; en escenas con bloom, revisar que el color no queme los brillos.
- Curvas de movimiento nuevas en `kit.js` de los dos kits (además de la existente `K.easeBack`): `K.resorte(u, rebotes, amort)`, `K.escalon(u, n)` (movimiento a saltos, estilo stop motion).

## Medición de ritmo: `medir_movimiento.py`
`python3 /home/claude/repo/comun/medir_movimiento.py video.mp4 carpeta` (una vez: `pip install --break-system-packages -q opencv-python-headless`). Imprime una línea: cortes, porcentaje de cuadros con la cámara moviéndose, zoom, brillo, contraste y saturación; deja `medidas.csv` y `resumen.json`. Tarda ~25 s por minuto de video. No abrir sus hojas de 60 cuadros salvo que haga falta. En escenas planas sin textura puede no ver el movimiento (lo marca como "sin medida").

## Revisión de lectura: `lectura.py`
```bash
python3 /home/claude/repo/comun/lectura.py /home/claude/kit <carpeta_video>
```
Recorre toda la escena (sin tomar fotos, tarda segundos en 2D) y avisa qué texto del canvas desaparece antes de poderse leer: necesita letras ÷ 15 + 1.5 s, mínimo 1.5 s, contando solo el primer tramo completo dentro del cuadro. También avisa textos que nunca entran completos. No revisa subtítulos (los marca la voz), texto en texturas 3D ni contadores. Correrlo antes del render completo; un aviso en un título de 1 palabra que pasa rápido a propósito se puede ignorar.

## Música original: `musica/fondo.py`
Compone un fondo por reglas y lo toca con instrumentos reales (orquesta VSCO 2 CE y percusión afinada VCSL, ambos CC0: no exigen crédito).
```bash
pip install --break-system-packages -q soxr soundfile scipy        # una vez por chat
sh /home/claude/repo/comun/musica/tools/fetch.sh instruments vsco2ce   # ~410 MB, segundos en la nube
sh /home/claude/repo/comun/musica/tools/fetch.sh instruments vcsl      # ~285 MB
python3 /home/claude/repo/comun/musica/fondo.py <carpeta_video>/musica.wav <duracion_s> curioso 1
```
- Estilos: `curioso` (pizzicato + marimba), `tension` (cuerdas cortas + timbal), `calma` (arpa + cuerdas), `misterio` (vibráfono con arco + campanas). La semilla (último número) da otra variación; un bpm opcional al final cambia el tempo.
- En `mezcla.py`: `m.poner(0, m.archivo('musica.wav', 0.12), 'mus')`. La voz debe quedar unos 10 dB arriba de la música.
- Imprime los instrumentos y la línea de créditos. Con estos dos paquetes todo es CC0; el piano (`piano`, Salamander) es CC BY y exige crédito: `fondo.py` no lo usa.
- Para una pieza a mano: `from core.audio import sampler as S` (con `sys.path` en `comun/musica`), `S.render([(t, 'cellos', 'D3', dur, vel, pan), …], dur)`. Lista: `S.instruments()`.
- **No escuchado por Claude**: los fondos se revisaron por volumen y graves, no de oído. Escuchar antes de publicar.

## Sonidos sin internet: `sonidos.py`
890 sonidos con licencia comprobada: 730 efectos (golpes, puertas, papel, pasos, agua, lluvia, animales, dinero, cocina), 44 transiciones, 85 remates musicales y 31 canciones de Kevin MacLeod. 825 son CC0 (sin crédito); las canciones y unos pocos efectos son CC-BY (crédito obligatorio en la descripción). Sustituye a `sfx_buscar.py` en la nube, donde Freesound está bloqueado.
```bash
python3 /home/claude/repo/comun/sonidos.py buscar puerta madera          # español o inglés; --tipo sfx|transicion|remate|musica, --libre (solo CC0), --n 12
python3 /home/claude/repo/comun/sonidos.py ver kenney-rpg-door-open-1     # etiquetas, autor, crédito
python3 /home/claude/repo/comun/sonidos.py copiar <carpeta_video> id1 id2 # copia a <carpeta>/sonidos/ y escribe CREDITOS.txt
```
- La primera búsqueda de cada sesión baja la biblioteca de GitHub (9 s, 250 MB, a `/home/claude/sonidos`, fuera del repo).
- En `mezcla.py`: `m.poner(t, m.archivo('sonidos/<id>.ogg', 0.4), 'fx')`. Se pega cada sonido a un contacto visible (puerta que se cierra, pie que pisa), no uno en cada corte.
- Si `CREDITOS.txt` dice que alguno exige crédito, ese texto va en la descripción del video (Dato Puro: también en los textos para redes).
- Para fondo musical se prefiere `musica/fondo.py`: las canciones de MacLeod se oyen en miles de videos.
- **No escuchado por Claude**: los sonidos se eligen por etiqueta y duración. Escuchar el video antes de publicar.

## Acabado de cine: `acabado.py` y `mod/efectos.js` (25 nov 2026)
Ideas tomadas de las skills de Remotion (código propio, sin usar Remotion). Sirven igual en Dato Puro y en historias.
- **Desenfoque de movimiento**: en la escena, `window.DESENFOQUE = [{desde: 0.4, hasta: 1.1, muestras: 8, obturador: 0.5}]`. En esos tramos cada cuadro se arma promediando 8 instantes dentro de medio cuadro (obturador de 180°, como cámara de cine): lo rápido deja estela en vez de verse a saltos. Cuesta tantas veces el render como muestras: solo en tramos rápidos (objetos que cruzan, transiciones, golpes de cámara). `render.py` lo aplica solo, también en `muestras`.
- **Color final**: en `formato.json`, `"color": {"exposicion": 0.05, "temperatura": 0.25, "contraste": 1.08, "saturacion": 1.12, "vineta": 0.45}` (neutros 0, 0, 1, 1, 0; temperatura de −1 frío a 1 cálido). `render.py codificar` lo aplica con ffmpeg a todo el video; casi no cuesta. No se ve en `muestras`: revisar en el mp4. Valores suaves: arriba de contraste 1.15 o saturación 1.25 se ve exagerado.
- **Destello de luz en un corte**: `<script>__MOD:efectos__</script>` y `EF.luzFuga(g, W, H, u, {semilla, colores, fuerza})` (también `K.luzFuga` / `C.luzFuga`) al final del cuadro, con `u` de 0 a 1 en ~0.8 s alrededor del corte; el corte de escena va en `u = 0.5`. Uno o dos por video, en el cambio más importante; en cada corte cansa.
- **Acercamiento parejo**: `EF.zoomParejo(1, 3, u)` en vez de `lerp(1, 3, u)`: el acercamiento se siente a velocidad constante (la escala se percibe en proporción).
- **Animación "a dos" (historias)**: `EF.posterizar(t, 12)` en el `t` de los personajes (no de la cámara): se mueven a 12 cuadros por segundo, como caricatura dibujada a mano. Probado: 72 cuadros, 36 distintos. Decisión de estilo: usar todo el video o nada.
- Demo: `dato-puro/kit/galeria/acabado` (4 s). Para comparar, la misma escena sin acabado: poner `window.SIN_ACABADO = true` y quitar "color" de `formato.json`.

## Créditos
- `acabado.py` y `mod/efectos.js`: ideas de las skills de Remotion (https://github.com/remotion-dev/remotion, `packages/skills`), reescritas; no se copió código.
- `sonidos.py` usa la biblioteca de stickman-video-director (código MIT; cada grabación con su licencia): https://github.com/kaomei/stickman-video-director, fijada a un commit para que no cambie.
- `look3d.js` reescribe para three.js los shaders `lensblur.ts` y `grade.ts`, y `medir_movimiento.py` copia `medir_30fps.py`, ambos de shorts-animados-claude (MIT): https://github.com/luispablovillasenor-afk/shorts-animados-claude — licencia en `LICENSE-MIT-shorts-animados.txt`.
- Íconos: Tabler Icons (MIT). Gráficas: D3 (ISC) y d3-sankey (BSD-3). Física: matter-js (MIT). `circuito.js` es propio; la idea visual (puntos de corriente y colores por voltaje) viene de CircuitJS (GPL-2.0), del que no se copió código.
- `lectura.py` adapta la regla y el método de `core/render/readcheck.mjs` y `musica/core/audio/`, `musica/tools/` son copia de lemo-opuscar (Lemomo / LemoLab), código MIT: https://github.com/lemomo-ai/lemo-opuscar — licencia en `musica/LICENSE-MIT-lemo-opuscar.txt`.
- Instrumentos: Versilian Studios (VSCO 2 CE, VCSL, CC0), FreePats y Karoryfer (CC0), Salamander Grand Piano (CC BY 3.0).
