# Recetas Dato Puro: qué módulos usar según el tipo de tema (10 nov 2026)

Punto de partida, no obligación. Antes de escribir una escena: (1) decide el tipo de tema, (2) copia la demo de `kit/galeria/` más parecida, (3) cambia datos, textos y tiempos. El detalle de cada función está en `kit/MODULOS.md`. La regla del canal sigue arriba de todo: no repetir el estilo ni los recursos del video anterior (revisar el último `claude/guion-*.md`).

## Esqueleto común de `escena.html`
```html
<script>__THREE__</script>            <!-- solo si hay 3D -->
<script>__KIT__</script>
<script>__MOD:tinta__</script>        <!-- los módulos que se usen -->
<script>
const D = __DATA__; K.datos(D);
const T0 = { gancho: K.S('01'), dato: K.wt('02', 'palabra'), cierre: K.S('05') };  // tiempos desde la voz, nunca a mano
// 3D: K.tres(...) + K.tomas([...]) ; 2D: K.capa2D()
const TR = K.transiciones([{ t: K.S('02'), tipo: 'barrido' }]);
const sub = K.subtitulos('limpio', '#ffd23f');
window.renderAt = t => { /* escena */ TR(OV, t); sub(t); };
window.listo = true;
</script>
```
- Los cortes de cámara y las transiciones van en el inicio de un bloque o de una frase (`K.S`), y los resaltados en la palabra exacta (`K.wt`).
- Un cambio visual (corte, objeto nuevo, rótulo, zoom) cada 2 a 4 s. Ninguna toma fija de más de 5 s.
- Zona segura: contenido entre y≈480 y 1350; subtítulos en 1430–1530; nada importante arriba de 250 ni abajo de 1600.

## 1. "¿Mito o dato?" (ejemplo: neutral en bajadas)
- **Estructura**: escena cotidiana con la frase del mito (0–6 s) → sello con el veredicto en la palabra exacta → mecanismo por dentro (por qué) → consecuencia práctica → pregunta final.
- **Módulos**: `objetos` o `paisaje` para la escena; `tinta` (`DB.sello`, `DB.tachar`) para el veredicto; `graficas` (`G.versus`, `G.medidor`) para comparar las dos opciones.
- **Cuidar**: si el veredicto tiene condiciones ("al menos si tu coche es moderno"), la condición va en pantalla junto al sello. Medidores sin cifra verificada se rotulan "ilustrativo".
- **Sonido**: `boom` en el veredicto, `bip` en cada paso del mecanismo.

## 2. Dinero y consumo (ejemplo: Buen Fin, consumo en espera)
- **Estructura**: objeto con precio o recibo → cifra grande → de dónde sale la cifra (cálculo mostrado paso a paso) → qué hacer.
- **Módulos**: `tinta` completo (papel, sellos, etiquetas de precio); `objetos` (tele, refri, celular, contacto, clavija, moneda, billete); `graficas` (`G.contador` con `pre:'$'`, `G.barras`, `G.deCada`).
- **Cuidar**: toda cifra con `G.fuente`; si es un ejemplo, la palabra "ejemplo" en pantalla. Precios de tiendas reales no; logos tampoco. Conexión contacto-clavija como en `galeria/objetos`.

## 3. Proceso físico o "cómo funciona" (ejemplo: transistores, amplificador, filtro de agua)
- **Estructura**: objeto completo → corte o rayos X → una sola pieza en movimiento → vuelta al objeto completo con el efecto visible.
- **Módulos**: 3D propio del tema (crearlo nuevo y, si es reutilizable, agregarlo a `objetos.js`); `K.tomas` con acercamientos; `DB.etiqueta3D` o `K.rotulo` para nombrar partes; partículas `K.nube` para flujo (electrones, agua, aire).
- **Cuidar**: rótulos pegados a su pieza (regla de coherencia); esquemas simplificados se rotulan "esquema simplificado"; no copiar el diseño de un producto real.

## 4. Comparación o ranking (ejemplo: qué gasta más en casa)
- **Estructura**: pregunta → candidatos uno por uno (del menor al mayor, el ganador al final) → gráfica con todos → remate.
- **Módulos**: `graficas` casi solo (`G.barras` horizontal con `destacar`, `G.icono`, `G.deCada`); un objeto 3D por candidato si el tiempo alcanza. Es la receta más rápida de renderizar (2D).
- **Cuidar**: mismas unidades y mismo periodo para todos; el orden de las barras igual al orden en que la voz los menciona.

## 5. Lugares, historia y escala (ejemplo: Pale Blue Dot, polvo de estrellas)
- **Estructura**: lugar o fecha → viaje (mapa, línea de tiempo o zoom) → dato que cambia la escala → cierre emotivo.
- **Módulos**: `mapa` (`M.pais`, `M.punto`, `M.arco`), `G.linea_tiempo`, `K.tierra` y `K.estrellas` del kit base; subtítulos `limpio` u `ocaso`.
- **Cuidar**: coordenadas verificadas; fechas y nombres tal como en la fuente; no dibujar personas reales; citas solo con `G.cita` y comprobadas al 100 %.

## 6. Cuerpo y mente (ejemplo: sacudida hípnica, vibración fantasma, efecto puerta)
- **Estructura**: situación que todos han vivido → nombre del fenómeno → explicación (como hipótesis si la fuente lo dice así) → "no estás solo" con `G.deCada`.
- **Módulos**: `objetos` (`OB.persona`, celular, casa), `graficas` (`G.deCada`), estilo libre.
- **Cuidar**: nada de consejos médicos; "X de cada 10" solo con el dato exacto de la fuente y su `G.fuente`; las hipótesis se dicen y se rotulan como hipótesis.

## Tabla rápida
| Necesito… | Usar |
|---|---|
| Porcentaje | `G.deCada` (nunca "%" suelto) |
| Cifra protagonista | `G.contador` + `G.fuente` |
| Antes / después, mito / dato | `G.versus`, `DB.sello`, `DB.tachar` |
| Nombrar una pieza 3D | `DB.etiqueta3D` (tinta) o `K.rotulo` |
| Cambio de escena | `K.transiciones` (tipo distinto al anterior) |
| Cámara | `K.tomas` (cortes en inicios de frase) |
| Miniatura | `mini.js` + `render.py miniatura` (no responder la pregunta en la portada) |
| Probar que el kit funciona | `python kit/probar.py` |

## Antes del render completo
1. `render.py muestras` con tiempos que incluyan cada transición y cada rótulo.
2. Revisión de coherencia rótulo por rótulo (sección 0 de `pipeline-produccion.md`).
3. Comparar con el video anterior: ¿mismo estilo, misma paleta, mismas transiciones? Si sí, cambiar.
