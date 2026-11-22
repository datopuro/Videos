# Utilería: cómo usarla y cómo agregar un objeto nuevo (para cualquier modelo)

Regla del canal (del usuario, 16 nov 2026): **en una historia no se dibuja ningún objeto suelto dentro de la escena.** Todo mueble, vehículo o cosa viene de `mod/utileria.js`. Si falta, se agrega ahí siguiendo esta guía, se revisa en el catálogo y hasta entonces se usa. Lo que se prohíbe: rectángulos y óvalos "que intentan ser algo", pies o cuerpos que asoman fuera de donde van, y objetos que cambian de color entre escenas.

## Usar lo que ya existe
```js
<script>__CARICATURA__</script><script>__MOD:utileria__</script>
const H = C.historia({                       // UNA vez por video; aquí viven colores y tamaños
  personajes: { ana: { piel, pelo, ropa } },
  objetos: { sofa: { tipo: 'sillon', plazas: 2, color: '#b5523b' }, lancha: { tipo: 'bote', agua: 'rgba(58,120,150,0.92)' } }
});
H.obj('lancha').dibujar(g, { x, y, escala, rot, t, espejo, dentro: [
  (gg, a) => H.per('ana').dibujar(gg, { t, x: a.x, y: a.y, escala: a.escala, pose: { sentado: true, pi: [10, 0], pd: [10, 0] } })
] });
```
- Tipos y lugares: ver el catálogo (`escenas/catalogo_utileria`). Hoy: sillon, silla, banca, asiento_avion, escritorio, cama, mesa, lampara, planta, puerta, ventana, tienda, fogata, bote, velero, coche, avion, arbol, roca; desde Mary Anning: hoja (dibujo plesiosaurio|hueso|carta|articulo, `trazo` 0–1), libro (`abierto`), canasta (`lleno`), martillo (origen en la mano), amonita, craneo, ictiosaurio y plesiosaurio (`revela` 0–1, `losa`), vela (`encendida`), bulto (bebé), caja, carreta (`giro`), sobre, monedas (`cuantas`), vitral, vitrina (1 lugar), perro (`camina`).
- `dentro` lleva una función por lugar (o `null`). El objeto dibuja: atrás → ocupantes recortados → frente. No hay que recortar nada a mano.
- Pasar `color`, `plazas`, `ancho`… al dibujar da error a propósito: se cambian en `C.historia`.
- Opciones al dibujar que sí cambian con el tiempo: `abierta` (puerta, 0 a 1), `giro` (ruedas del coche), `cinturon` (asiento de avión), `t`.
- Para iluminar objeto y ocupantes juntos: `C.iluminar(g, gg => H.obj('sofa').dibujar(gg, {...}), {tinte, borde})`.

## Agregar un objeto nuevo: pasos obligatorios
1. **Buscar una referencia mental clara**: ¿qué 3 a 6 piezas lo hacen reconocible? (Un bote: casco curvo, borda, tablones, remo. Sin esas piezas es "una banana".)
2. **Copiar la plantilla** de abajo dentro de `mod/utileria.js`, antes de `C.TIPOS_UTILERIA = TIPOS`.
3. **Medidas reales en unidades del personaje**: una persona de pie mide ~374 de alto y ~160 de ancho de cabeza; sentada, la cadera queda a 100 del piso y la cabeza llega a −374. Origen del objeto: el piso, al centro; "y" negativa hacia arriba.
4. **Cada pieza con `forma()`**, nunca con `fillRect` suelto: así lleva relleno, sombra propia del lado contrario a la luz, brillo, y contorno del mismo grosor que los personajes.
5. **Mínimo de acabado**: sombra de piso (`contacto`), 2 tonos del mismo color (`tono(col, ±0.1)`), y al menos 2 detalles interiores con `raya()` (costuras, vetas, juntas, manijas). Si mide más de 300 de ancho, al menos 4 piezas distintas.
6. **Si alguien puede ir dentro o detrás**: definir `anclas` (dónde van los pies de cada ocupante) e `interior(g)` (la zona donde SÍ se ve el ocupante). Todo lo que deba tapar al ocupante va en `frente`.
7. **Nada de aleatorio ni de tiempo real**: solo `t` y `C.hash`. Parpadeos y llamas a menos de 6 ciclos por segundo (a 24 cuadros, más rápido se ve como error).
8. **Probar**: `python3 kit/render.py muestras kit/escenas/catalogo_utileria 1.0` y abrir `m/m_0001.00.png`. La escena corre `C.probarUtileria`, que falla si un tipo deja el lienzo alterado, le faltan partes o tiene ocupantes sin recorte.
9. **Revisar la celda contra esta lista** antes de usarlo:
   - ¿Se reconoce sin leer el nombre?
   - ¿El muñeco de referencia cabe y nada de él asoma por donde no debe?
   - ¿La sombra cae del mismo lado que en los demás objetos?
   - ¿Se ve del mismo "mundo" que sus vecinos (grosor de línea, saturación)?
   - ¿Tiene sombra de piso o está flotando?
10. **Anotarlo** en la lista de tipos de este archivo y subirlo al repo.

## Plantilla
```js
TIPOS.nombre = o => {
  const col = o.color || '#b5523b', W = o.ancho || 300;            // todo lo configurable sale de la receta "o"
  return {
    ancho: W,                                                        // ancho real, para el catálogo
    anclas: [{ x: 0, y: 0, escala: 1 }],                            // [] si nadie va dentro; rot: -90 para acostado
    interior(g) { g.beginPath(); g.rect(-W, -3000, W * 2, 2800); }, // zona visible del ocupante (omitir en asientos abiertos)
    atras(g, e) {                                                    // lo que queda DETRÁS del ocupante
      contacto(g, 0, W * 1.1);
      forma(g, rr(-W / 2, -200, W, 200, 20), col, { sombra: 10, dentro: gg => raya(gg, [[-40, -150], [40, -150]], frio(col, 0.3), 2.5) });
    },
    frente(g, e) {                                                   // lo que TAPA al ocupante
      forma(g, rr(-W / 2, -90, W, 90, 12), tono(col, -0.1), { sombra: 8 });
    }
  };
};
```
Herramientas dentro del archivo: `forma(g, camino, color, {sombra, brillo, lw, dentro, regla})`, caminos `rr(x,y,w,h,r)`, `poli([[x,y]…])`, `elip(x,y,rx,ry)` o una función propia `gg => { gg.beginPath(); … }`; `raya(g, puntos, color, grosor)` (un punto de 4 números es curva); `masa(g, [[x,y,r]…], color)` para follaje, nubes y humo; `tono(color, k)` aclara u oscurece; `frio(color, k)` da el tono de sombra; `contacto(g, x, ancho)`.

## Lugares (`mod/fondos.js`): usar y agregar
Un lugar es el fondo completo de una toma. Devuelve `{piso, dibujar, frente, luz}` y se usa siempre en este orden: `L.dibujar` → objetos y personajes → `L.frente` → `L.luz` → textos.

Por qué en capas: lo que está lejos se ve más claro, sin contorno y se mueve menos cuando la cámara se desplaza; eso es lo que da profundidad en 2D. La hora del día no se pinta objeto por objeto: `L.luz` tiñe toda la toma al final, así personajes y objetos quedan con la misma luz que el fondo.

Pasos para agregar uno:
1. Copiar el lugar que más se parezca dentro de `mod/fondos.js` (por ejemplo `LUGARES.campo`) y cambiarle el nombre.
2. La función recibe `(o, hp)`: `o` es la receta (congelada) y `hp` la paleta de la hora (`hp.cielo`, `hp.lejos`, `hp.luna`, `hp.sol`). Nunca escribir colores de cielo a mano: usar `cielo(g, hp, e, yHorizonte, o)`.
3. Capas de atrás hacia adelante, mínimo tres: lejana (color mezclado con `hp.lejos` al 60–80 %, sin contorno), media (mezcla 20–50 %) y piso (degradado, más oscuro abajo). Para mezclar colores usar `mez(a, b, k)` **solo con colores `#rrggbb`**; `tono()` devuelve `rgb(...)` y dentro de `mez` da negro.
4. Todo lo que se repite a lo ancho va con `repetir(px, factor, paso, margen, fn)`: factor 0.1–0.3 lejos, 0.5–0.9 medio, 1 en el piso, más de 1 en `frente`. Así el lugar no se acaba cuando la cámara se mueve.
5. El piso lleva textura (pasto, tablas, losetas, montículos): una franja de color liso se ve vacía.
6. Nada de `Math.random` ni estado entre cuadros: usar `C.hash(i)` y `t`. Un cuadro debe salir igual en cualquier orden.
7. `luz(g, e)` termina en `tenir(g, hp, extra)`; en `extra` van rayos, focos de postes o nieve cayendo.
8. Agregarlo a `escenas/demo_fondos/escena.html` con un personaje y un objeto, renderizar muestras y revisar: que no haya huecos negros entre cielo y suelo, que el personaje se lea contra el fondo (ropa y piel distintas del color que tiene detrás) y que funcione con las cuatro horas (`C.probarLugares` lo corre solo).
9. Anotarlo en `kit/INDICE.md`.

Errores que ya pasaron con los lugares:
- Hueco negro en el horizonte: el cielo se pintaba solo hasta el horizonte y las colinas bajas no lo tapaban. Ahora `cielo` rellena todo el cuadro.
- Troncos de primer plano claros y con contorno: tapaban la escena. Lo que va en `frente` es silueta oscura, sin contorno y pegada a los bordes.
- El agua del bote se veía como un rectángulo sobre el mar: el agua propia de `bote` y `velero` ahora se desvanece hacia las orillas.
- Escribir el marcador de módulo (doble guion bajo + MOD) dentro de un comentario de un `.js`: `render.py` lo sustituye y la página deja de cargar.

## Errores que ya pasaron (no repetir)
- Asiento rojo en una escena y azul en otra (Larisa): por eso existe `C.historia`.
- Cuatro cabezas asomando tras un escritorio sin cuerpo: usar `escritorio` con ocupante; el recorte deja ver torso y hombros.
- Bote dibujado como media luna plana (Ada): casco + borda + tablones + agua delante.
- Personajes encimados en una banca: el ancho por plaza es 196, no menos (la cabeza mide ~160).
- Cuartos vacíos con el personaje diminuto: un interior lleva al menos piso, pared con zócalo, una ventana o puerta y dos objetos de utilería; el personaje ocupa de 35 a 60 % del alto en planos medios.
