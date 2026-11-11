# Kit Dato Puro: menú de módulos (v9, 10 nov 2026)

Léeme antes de escribir una escena. Regla: **antes de inventar algo, busca aquí y copia de `galeria/`**. Cada módulo tiene una demo que funciona (`galeria/<nombre>/escena.html`); copiarla y cambiar parámetros es más seguro que escribir desde cero.

Restaurar en un chat nuevo: además de `kit/*`, restaurar `kit/mod/*` en `kit/mod/` y `kit/galeria/*` en `kit/galeria/` ANTES de correr `instalar.sh` (el instalador genera `mod/mapa.js`).

## Cambios de la base (compatibles con escenas viejas)
- **`render.py`**
  - `__MOD:nombre__` en `escena.html` carga `kit/mod/nombre.js` (va después de `__KIT__`).
  - `formato.json` opcional en la carpeta del video: `{"ancho":1080,"alto":1920,"fps":30}` es el valor por defecto; con `1920×1080` y `24` sirve para horizontal. `K.W`, `K.H` y `K.FPS` salen de ahí.
  - `tramo <carpeta> <seg_ini> <seg_fin>`: renderiza solo ese tramo.
  - `foto <carpeta> <t> [salida.jpg]`: un cuadro a resolución completa, sin subtítulos.
  - `miniatura <carpeta> [t]`: carga `mini.js` de la carpeta del video encima de la escena y guarda `miniatura.jpg`. `mini.js` redefine `window.renderAt` (ver `galeria/tinta/mini.js`). Sustituye la técnica de copiar `escena.html` a `mini/`.
  - `D.rms` y `K.rms(t)`: volumen de la voz por cuadro (0–1), para bocas, pulsos o medidores.
  - Al terminar `cuadros` imprime s/cuadro. Las hojas de muestras llevan el tiempo rotulado.
- **`kit.js`**
  - `K.wt(bloque, palabra, n=0)`: ignora mayúsculas y puntuación (también en lo que le pasas) y `n` elige la aparición (0 = primera). Si no encuentra la palabra, el error lista las palabras del bloque.
  - Estilos de subtítulos nuevos: `marcador` (texto oscuro con resaltador, para fondos claros) y `ocaso` (crema con acento, para fondos oscuros cálidos).
  - `K.orbita([x,y,z], az, el, d)`, `K.proy(punto3D) → [x, y, visible]`.
  - `K.tomas([{t, obj:[x,y,z], az, el, d, fov?, deriva?, temblor?, corte?, curva?}, …])` devuelve `f(t)` que mueve la cámara e informa el índice de la toma. Entre dos claves interpola con `K.ease3`; una clave con `corte:true` es corte seco. `deriva` gira lento (rad/s) mientras dura la toma.
- **`sfx.py`**: `m.archivo(ruta, amp, recorte)` carga un mp3/wav real (ver `SONIDO.md` y `sfx_buscar.py`, buscador de Freesound tomado de video-shotcraft, Apache-2.0, solo funciona en la laptop). `m.W(bloque, palabra, n=0)` con la misma normalización que `K.wt`.

## mod/tinta.js: 3D de tinta sobre papel (estilo Buen Fin)
Demo: `galeria/tinta`. Sin bloom ni entorno: `K.tres({bloom:false, entorno:false, fov:30})` y luego `const TI = K.tinta()`.
- `TI.C`: paleta (tinta, papel, hoja, amarillo, rojo, azul, verde, gris). Se cambia con `K.tinta({colores:{…}})`.
- `TI.pieza(geo, color, padre, {pos, rot, fino, contorno:false, aristas, sombra:false, mat})`: malla caricatura de 3 tonos con contorno negro.
- `TI.contorno(malla, fino)`: agrega contorno a una malla o `InstancedMesh` ya creada.
- `TI.caja(w,h,d,radio)`, `TI.toon(color)`, `TI.suelo()` (papel con sombra dura azul), `TI.luz(x,z)` (mueve el sol con el sujeto).
- `const DB = TI.dibujo(OV)`: trazos 2D que "hierven" a 8 pasos por segundo.
  - `DB.sello(texto,x,y,a,{fs,rot,color})`, `DB.nota(texto,x,y,a,{t,fs})`, `DB.tarjeta(x,y,w,h,a,t)`.
  - `DB.flecha(x0,y0,x1,y1,a,{t,color,curva})` (se dibuja progresivamente), `DB.circulo(x,y,rx,ry,a,{t})`, `DB.tachar(x,y,w,a,{t})`, `DB.resaltar(x,y,w,h,a)`.
  - `DB.etiqueta3D(texto, Vector3, dx, dy, a, {t})`: nota pegada a un punto 3D.
  - `DB.trazo(pts,col,w,t,a,j,cerrar)`, `DB.trazoParcial(pts,col,w,t,u)`, `DB.txt(...)`.
- Lecciones:
  - El grosor del contorno va en unidades locales de la malla: si escalas una malla, su contorno escala también. Usa `fino:true` en piezas chicas.
  - Los colores salen más oscuros que el hex (el tono medio es 170/255): elige colores claros.
  - `resaltar` usa `multiply`: sobre fondo oscuro casi no se ve; ponlo sobre papel o una tarjeta.
  - Con fov 30 en vertical, el ancho visible es ≈ 0.3·d: un conjunto de 5 m necesita d ≈ 19.

## mod/graficas.js: gráficas y recursos 2D (no necesita THREE)
Demo: `galeria/graficas`. `const G = K.graf(OV, 'oscuro')` o `K.graf(OV, 'papel')`; un tercer argumento cambia colores (`{acento:'#…'}`). Casi todo recibe `u` de 0 a 1 (avance de la animación): se pasa `(t - t0) / duracion`.
- `G.deCada(n, total, x, y, ancho, u, {icono, cols, color, texto, fs})`: "7 de cada 10" con íconos. Es la forma de mostrar porcentajes del canal.
- `G.contador(valor, x, y, fs, u, {pre:'$', suf, dec, desde, etiqueta})`: número que sube.
- `G.barras(datos, x, y, w, h, u, {suf, pre, dec, max, horizontal, anchoEtiqueta, valores:false})` con `datos = [{e:'etiqueta', v:12, destacar:true, color}]`. Si alguno lleva `destacar`, los demás salen grises. `\n` en la etiqueta hace dos renglones.
- `G.linea(pts, x, y, w, h, u, {marcasY, marcasX, suf, y0, y1, color})` con `pts = [[x, y], …]`; devuelve `{X, Y, punta}` para poner rótulos sobre la curva.
- `G.dona(fraccion, x, y, r, u, {texto})`, `G.medidor(fraccion, x, y, r, u, {texto, color})` (aguja; verde, amarillo o rojo según el valor).
- `G.versus(izq, der, y, u)` con `{titulo, icono, valor, color, nota}`: dos paneles "antes / después".
- `G.cita(texto, fuente, x, y, w, a)`: tarjeta de cita con etiqueta "FUENTE ·"; devuelve su alto. `G.fuente(texto, a, y)`: etiqueta de fuente sola.
- `G.linea_tiempo(hitos, x, y, w, u)` con `[{e:'1947', nota:'…', destacar}]`.
- `G.icono(nombre, x, y, tam, color, a, rot)`: persona, punto, cuadro, casa, rayo, gota, moneda, reloj, coche, foco, celular, bateria, enchufe, termometro, check, cruz, flecha. Se pueden agregar a `G.ICONOS` (dibujar centrado en 0,0 con `g.fill()`/`g.stroke()`, tamaño `s`).
- `G.panel(x, y, w, h, a)`, `G.txt(...)`, `G.num(v, dec)` (formato es-MX).
- Regla del canal: toda cifra que se dibuje con estas funciones sale de los datos verificados del guion, y lleva `G.fuente` o `G.cita` si es un dato citado. En demos y pruebas, rotular "ejemplo".

## mod/mapa.js: mapas 2D (no necesita THREE)
Demo: `galeria/graficas` (últimos 4 s). **`mapa.js` es un archivo generado**: `instalar.sh` / `instalar.py` lo arman con `hacer_mapa.js` a partir de Natural Earth (dominio público, paquete npm `world-atlas`) y `mod/mapa_codigo.js`. Para cambiar el código se edita `mapa_codigo.js` y se corre `node hacer_mapa.js`.
- `const M = K.mapa(OV, {region:'mundo'|'mexico'|'america'|'latam'|'europa'|[lon0,lon1,lat0,lat1], x, y, w})`.
- `M.base(a, {tierra:'color', borde})`, `M.pais('mexico', a, color, {borde})`. Países incluidos: `M.paises` (25; para agregar más, añadir su código ISO numérico a la tabla `N` de `hacer_mapa.js`).
- `M.punto(lon, lat, a, {texto, pulso:t, color, colorTexto, sombra:0, dx, dy})`, `M.arco([lon,lat], [lon,lat], u, {guiones:[14,12]})`, `M.P(lon, lat) → [x, y]`.
- Límites: no hay estados de México ni ciudades incluidas (las coordenadas se pasan a mano y deben verificarse). El contorno mundial es de baja resolución (1:110 m); México tiene uno más fino (1:50 m) que se usa con `region:'mexico'`.
- Sobre fondo claro pasar `sombra: 0` en los textos de `punto`, o sale un halo negro.

## mod/transiciones.js: transiciones 2D (no necesita THREE)
Demo: `galeria/paisaje` (las 9, una tras otra) y `galeria/objetos`.
- `const TR = K.transiciones([{t: 12.4, tipo: 'barrido', d: 0.5, color: '#2f5bd3'}, …])`; al final de `renderAt` se llama `TR(OV, t)`. La pantalla queda tapada por completo justo en `t`: **el cambio de escena o el corte de cámara se pone en ese mismo `t`** (con `K.tomas`, la clave con `corte:true` lleva el mismo tiempo).
- `TR.escena(t)` da el número de escena (cuántos cortes han pasado) y `TR.cortes` la lista de tiempos, útil para los `whoosh` de `mezcla.py`.
- Tipos: `fundido`, `flash`, `barrido` (`dir`: izq, der, arriba, abajo), `diagonal`, `cortina` (`n`), `iris` (`centro:[x,y]`), `bloques` (`n`), `persiana` (`n`), `papel` (hoja con borde en zigzag), `tinta` (mancha de tinta irregular que crece desde `centro`; `semilla` cambia la forma), `puertas` (dos hojas que cierran al centro con una rendija de luz `brillo` y luego abren; para cambios de "antes / después"). Idea de video-shotcraft: anclar `iris` o `tinta` en un objeto real de la escena (el centro de un foco, una moneda) para que el corte tenga sentido.
- Suelta: `K.transicion(g, tipo, u, {color})` con `u` de 0 a 1.
- No repetir la misma transición dos veces seguidas en un video ni usar el mismo juego que en el video anterior.

## mod/objetos.js: objetos 3D frecuentes
Demo: `galeria/objetos` (en estilo tinta). `const OB = K.objetos()` da materiales estándar; `K.objetos({pieza: TI.pieza})` los dibuja con contorno de tinta. Todos están en metros reales, con el origen en el piso (o en el centro si son de mano), y devuelven `{g, …partes}`.
- Grandes: `OB.coche({color, freno})` → `rodar(distancia)`; `OB.casa({ancho, fondo, alto, color, colorTecho})`; `OB.persona({color, piel, estatura})` → `caminar(fase)` (muñeco sin cara: no representa a nadie real); `OB.arbol({pino, escala})`; `OB.refri()` → `abrir(u)`; `OB.tele({pantalla: (ctx, w, h) => …})` → `redibujar(f)`; `OB.mesa()` → `alto`; `OB.pared({ancho, alto})`.
- De mano (tamaño real, usar `escala` o acercar la cámara): `OB.celular({pantalla})`, `OB.foco({encendido})`, `OB.bateria()`, `OB.moneda()`, `OB.billete({texto})` (genérico y rotulado "recreación"), `OB.contacto()` (placa doble tipo México/EUA: dos ranuras verticales y tierra) → `tomas`, `puntoToma(i)`; `OB.clavija({tierra})` (dos patas planas) → `cola()`; `OB.cable([puntos], {radio})`.
- Conexión correcta contacto-clavija (lección del video de consumo en espera): la clavija se alinea con UNA toma (`y` del contacto ± 0.026, más 0.004) y entra hasta que su cuerpo toca la placa (`z` de la clavija = `z` de la placa − 0.007 con el contacto mirando a +z). Ver la demo.
- Para piezas propias con el mismo estilo: `OB.p(geo, color, padre, {pos, rot, luz, metal, fino})`.
- Cámara para objetos de mano: `K.tres({cerca: 0.02})` y, en tinta, `TI.areaSombra(1)` para que la sombra tenga definición (el valor por defecto, 9 m, da sombras de bloques a esa escala).

## mod/paisaje.js: carretera low-poly con cielo (estilo "neutral")
Demo: `galeria/paisaje`. `const PA = K.paisaje({paleta: 'ocaso'|'dia'|'noche', pendiente, curva, relieve, pinos, despeje})`. Trae cielo, niebla, terreno, carretera, montes, pinos y luces; usar con `K.tres({bloom:[0.3,0.35,0.97]})`.
- `PA.poner(objeto, z, lado)` coloca y orienta algo sobre la carretera (z va de 30 a −370; con `pendiente` positiva, avanzar hacia z negativo es ir cuesta abajo).
- `PA.camSeguir(z, {atras, lado, alto, adelante, mira})`: cámara que sigue ese punto. `atras` negativo la pone por delante.
- `despeje: (x, z, lado) => 0..1` aplana el terreno y quita pinos donde estorban a la cámara (lección de neutral: los cerros tapaban el coche).
- `PA.P(z)`, `PA.alto(x, z)` para colocar cosas fuera de la carretera; `colores: {…}` cambia cualquier color de la paleta.

## Herramientas
- `python kit/probar.py [demo…]`: renderiza muestras de todas las demos (`tinta`, `graficas`, `objetos`, `paisaje`) y avisa si alguna falla. Correrlo después de tocar `kit.js`, `render.py` o un módulo, y revisar las hojas en `galeria/<demo>/m/hoja.jpg`.
- `kit/RECETAS.md`: qué módulos combinar según el tipo de tema (mito o dato, dinero, proceso físico, comparación, lugares e historia, cuerpo y mente).

## Cómo agregar algo nuevo al kit
1. Función nueva en el módulo que corresponda (o módulo nuevo `mod/<nombre>.js` que cuelgue de `K`).
2. Usarla en una demo de `galeria/` y revisar su hoja de muestras.
3. Documentarla aquí en una línea y agregar la demo a `probar.py`.
4. Subir los archivos al proyecto (`kit/…`) y copiarlos a `C:\dato-puro\kit`.

## Ideas pendientes (no hechas)
- Estados de México en el mapa.
- Motor con pistón (está suelto en la escena de "neutral") y más objetos: estufa, lavadora, medidor de luz, tinaco.
- Persona con cara y expresiones en 3D (para 2D existe `caricatura.js` en el kit del canal de historias).
