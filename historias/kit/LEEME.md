# kit-historias (v1, 9 nov 2026)

Kit de render del canal Dato Puro, adaptado a caricatura 2D horizontal. Es un punto de partida: en el proyecto de historias se decide qué se usa, qué se cambia y qué se tira.

## Requisitos
- Python 3.10 o más reciente: `pip install numpy pillow playwright`, y luego `python -m playwright install chromium` si no está instalado.
- ffmpeg y ffprobe en el PATH.
- Para `transcribir.py`: `pip install sherpa-onnx`. Descarga el modelo Whisper small (~640 MB) la primera vez.
- No hace falta three.js: todo es canvas 2D.

## Archivos
| Archivo | Qué hace | Cambios respecto a Dato Puro |
|---|---|---|
| `render.py` | Muestras, cuadros, tramo, paralelo y codificar | Lee `formato.json` (default 1920×1080, 24 fps); `KIT_GL=gpu` usa la tarjeta de video; manda a la escena la envolvente de la voz (`D.rms`) para mover bocas; carga `escenas.json` y `datos.json` si existen; nuevo comando `tramo`; codifica sin audio si no hay `mezcla.wav`; cuadros con 6 dígitos |
| `caricatura.js` | Personajes con rig, caras, poses, fondos por módulos, cámara 2D, rótulos y globos | Nuevo |
| `prep.py` + `trozos.py` | `bloques.json` + voz → `timeline.json` y `voz.f32` | Sin cambios |
| `sfx.py` | Mezcla de voz, música y efectos a −14 LUFS | Sin cambios |
| `pausas.py`, `transcribir.py` | Verificar que el audio coincide con el guion | Sin cambios |
| `kit.js` | Utilidades del kit original (subtítulos, textos) | El tamaño ahora sale de `formato.json` |
| `revisa.py` | Hojas de revisión del video final | Reemplaza `revisa1fps.py`: acepta cualquier proporción y un intervalo (`revisa.py video.mp4 rev 3` saca un cuadro cada 3 s) |
| `ejemplo/` | Escena demo de 12 s: calle → súper → cajera → "3 DÍAS DESPUÉS" | Voz falsa solo para probar las bocas |
| `guia-canal-historias.md` | Guía de sugerencias del canal | — |

## Flujo
```
python transcribir.py proyecto/voz_original.mp3
(escribir proyecto/bloques.json)
python prep.py proyecto
(escribir proyecto/escena.html con __CARICATURA__ y __DATA__)
python render.py muestras proyecto 1 5 9 14 ...
(escribir proyecto/mezcla.py con: from sfx import Mezcla)
set KIT_GL=gpu
python render.py cuadros proyecto           (reanudable)
python render.py tramo proyecto 120 180     (solo de 2:00 a 3:00)
python render.py codificar proyecto video_v1.mp4
python revisa.py proyecto/video_v1.mp4 proyecto/rev 3
```
Para corregir una parte, borra los `fr/f_XXXXXX.jpg` de ese rango y vuelve a lanzar `cuadros` o `tramo`.

## caricatura.js en breve
```js
C.datos(D); const g = C.lienzo();
const p = C.personaje({ id, cuerpo:{estatura, complexion:'delgado|medio|robusto', edad:'nino|joven|adulto|mayor'},
  piel, pelo:{estilo:'corto|fleco|largo|coleta|rizado|afro|rapado|calvo', color},
  ropa:{arriba:{tipo:'playera|sudadera|camisa|bata|saco|vestido', color}, abajo:{tipo:'pantalon|short|falda', color}, pies:{tipo, color, acento}},
  accesorios:[{tipo:'gorro|gorra|lentes|delantal|mochila|gafete|barba|audifonos', color}] });
p.dibujar(g, { t, x, y, mira:1|-1, pose:'parado', ciclo:'caminar|correr', fase, poseB, k, cara:'neutral', caraB, k2, habla:true });
const l = C.lugar({ hora:'manana|tarde|atardecer|noche|interior', capas:{ cielo:[...], lejos:[...], fondo:[...], medio:[...], frente:[...] } });
l.fondo(g, cam, t); /* personajes */ l.frente(g, cam, t);
```
- **Poses**: parado, senalar, brazos_cruzados, manos_cabeza, encogido, mirar_reloj, sentado, agachado, saludar. Ciclos: caminar y correr.
- **Caras**: neutral, feliz, triste, miedo, enojo, sorpresa, duda, cansado, asco, orgullo. Se mezclan con `caraB` y `k2`.
- **Módulos de fondo**: cielo, sol, nubes, ciudad_lejana, edificios, calle, pared (liso, azulejo, ladrillo), piso (liso, loseta, madera), ventana, puerta (normal o automática con `abre`), estante (`vacio` 0–1), mostrador, letrero, lampara, arbol, colinas, rect. Los nuevos se agregan a `C.MODULOS`.
- **Cámara**: `{x, y, zoom, rot, temblor}`. `C.camLerp(a, b, u)` interpola entre dos cámaras y `C.encuadre(x, y, zoom)` centra en un punto.
- **Recursos**: `C.rotulo`, `C.globo` (con `{pensamiento:true}` es viñeta de pensamiento), `C.fundido`, `C.vineta`, `C.dividida` (pantalla partida).

## Medido
- Demo de 12 s a 1920×1080 y 24 fps: 288 cuadros en 75 s en la nube con SwiftShader (≈0.26 s/cuadro). A ese ritmo, 10 min (14 400 cuadros) serían ≈62 min.
- Con `KIT_GL=gpu` en la RTX 4060 debería ir varias veces más rápido; hay que medirlo en el primer piloto.

## Límites conocidos (versión 1)
- El personaje es de vista 3/4 con una sola dirección de cara (izquierda o derecha); no hay vista de frente ni de espalda.
- Las manos son círculos; no agarran objetos (eso requiere IK con un punto objetivo).
- La boca se mueve por volumen, no por sílaba exacta (falta usar visemas desde `alineacion.json`).
- La pose `mirar_reloj` se lee más como saludo; ajustar sus ángulos.
- Las rodillas muestran la unión de los dos segmentos (se ve el contorno).
