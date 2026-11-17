# Diagnóstico del proyecto de historias (16 nov 2026)

Fase 1 del encargo de mejora de animaciones. Todo lo que dice "medido" salió de una corrida real en la nube sobre `kit/escenas/juliane_caida.html` (la escena que el índice llama "referencia actual"), 1920×1080 a 24 fps, 470 cuadros.

## 1. Qué hay hoy

- **Tecnología**: una página HTML por video que dibuja en un canvas 2D con JavaScript (`window.renderAt(t)`). `kit/render.py` abre la página en Chromium (Playwright), pide cada cuadro, lo guarda como JPG y ffmpeg arma el mp4. Sin 3D.
- **Código de dibujo**: `kit/caricatura.js` (900 líneas: cámara, fondos por capas, efectos, textos y dos generaciones viejas de personaje) y `kit/rig2.js` (206 líneas: el personaje actual `C.personaje2`, curvas, resorte, luz de contorno).
- **Recetas**: 2 personajes y 3 fondos en JSON; 2 escenas de ejemplo en `kit/escenas/`.
- **Sonido**: `sfx.py` (mezcla), `prep.py` (tiempos de la voz), `comun/musica` (orquesta CC0).
- **Lo que NO está en el repo**: ningún video publicado. No hay carpetas de video (escena, voz, timeline, mezcla) ni los mp4. Solo el kit y dos escenas de muestra, sin audio.

## 2. Defectos encontrados

### Técnicos (medidos)
| # | Defecto | Dónde | Evidencia |
|---|---|---|---|
| T1 | Render muy lento en la nube: el canvas 2D se dibujaba con GPU emulada | `kit/render.py`, `abrir()` | 10 min 53 s para 19.6 s de video. **Corregido en esta rama: 1 min 22 s** (8×), imagen igual (<1 nivel de 255) |
| T2 | Parpadeo de un cuadro sí y uno no antes del negro (12 destellos por segundo) | `juliane_caida.html:105`, `Math.sin(t*90)` | `revisa_auto.py` marca "cuadro suelto" en 4.96, 5.00 y 5.04 s. Es una frecuencia más alta que la que 24 fps puede mostrar: sale un patrón irregular |
| T3 | Destello blanco casi total durante 2 cuadros | `juliane_caida.html:103`, `k: 0.95` | Cuadros 0.25–0.29 s casi blancos. Junto con T2, riesgo para personas fotosensibles y se lee como error |
| T4 | Tiempos escritos a mano, no salen de la voz | `juliane_caida.html:13` (`T`) y `:14` (`SUBS`) | 14 tiempos y 9 subtítulos tecleados. `timeline.json` de la escena está vacío. Cualquier cambio de voz desincroniza todo |
| T5 | La boca se mueve con una fórmula, no con el audio | `juliane_caida.html:83` | `Math.abs(Math.sin(t*12.5))`. El kit ya tiene `habla` con el volumen real (`voz.f32`) y no se usa |
| T6 | Fuentes distintas según la máquina | `caricatura.js:430, 440, 657, 670` (Arial, Arial Black) | En la nube "Arial Black" se convierte en Inter normal y Arial en Liberation Sans; en Windows sale la real. El mismo video se ve distinto |
| T7 | Subtítulo largo se aplasta en vez de partirse en dos renglones | `caricatura.js:670` `C.subTemp` | Usa el ancho máximo de `fillText`. En vertical (1080 de ancho) la frase de 6.0 s mediría ~1340 px y se comprime a 920 px |
| T8 | Formato contradictorio | `render.py:17` (1920×1080, 24 fps) contra `INDICE.md:5` ("vertical 1080×1920") | Las dos escenas de ejemplo están compuestas en horizontal con coordenadas fijas (960, 1920−420…) |
| T9 | Valor fijo de 24 fps en el grano | `caricatura.js:679` | `Math.floor(t*24)`; a 30 fps repite grano |
| T10 | Texto duplicado: globo y subtítulo dicen lo mismo a la vez | `juliane_caida.html:102` y `SUBS` | Hoja de muestras, 3.5 y 5.0 s |
| T11 | Código muerto y duplicado | `caricatura.js:105` (`C.personaje`), `:725` (`C.personajeB`), poses y caras v1 | Tres generaciones de personaje conviven (~40 % del archivo son las dos viejas); la escena de referencia solo usa la de `rig2.js`, y `juliane_piloto.html` todavía usa la v1.2. Además el regalo está dibujado dos veces dentro de la escena (`:97` y `:135`) |
| T12 | El resorte se recalcula desde el inicio en cada cuadro | `rig2.js:15` | Costo que crece con la duración del video. Hoy no se nota (19 s); en 60 s sí |
| T13 | `instalar.sh` descarga Chromium aunque ya exista | `kit/instalar.sh:3` | En la nube ya viene instalado |

### De animación y acabado (observados en cuadros; lo subjetivo está marcado)
| # | Defecto | Dónde | Evidencia |
|---|---|---|---|
| A1 | Imagen oscura, gris y con poco contraste | `juliane_caida.html:100` (lavado `multiply` al 78 %) y tintes de `C.iluminar` | Medido: brillo 0.30, contraste 0.12, saturación 0.31. El canal de referencia de la biblia de estilo mide brillo 0.43–0.54 y saturación 0.38–0.65. Parte es intención (tormenta), pero la cabina se ve lavada, no dramática |
| A2 | Grosor de línea inconsistente entre tomas | El contorno escala con el zoom de cámara (`C.camara`) | Primer plano a zoom 2.55: contorno de ~13 px. Plano abierto a 0.86: ~4 px. Vista desde arriba (`:232`): 3 px que se reduce hasta desaparecer |
| A3 | Personajes sin volumen ni peso | `rig2.js` | Rellenos planos sin sombra propia; sombra de piso apagada por defecto; sin cuello; manos = círculos; codos y rodillas en ángulo duro |
| A4 | Vida secundaria casi invisible | `rig2.js:188` y `:153` | Respiración de ±0.8 px. Parpadeo con periodo fijo por personaje (se vuelve metrónomo). Sin anticipación ni estirar/encoger en golpes |
| A5 | Solo vista de frente | `rig2.js` | No hay perfil ni tres cuartos: los personajes no pueden mirarse entre sí ni caminar de lado de forma creíble |
| A6 | Fondos pobres en interiores | módulo `cabina` | Paredes planas, sin textura, sin luz que venga de algún lado |
| A7 | Corte seco de la vista en primera persona a la vista aérea | `juliane_caida.html:272` | 16.17 → 16.21 s, sin transición; `revisa_auto.py` lo marca como salto |
| A8 | Cambio de estilo del personaje en la vista aérea | `juliane_caida.html:232` `filaArriba` | Juliane pasa de personaje a figuras simples (subjetivo: puede ser aceptable por la distancia) |
| A9 | Subtítulos chicos | `caricatura.js:670`, 40 px | 3.7 % del alto. En teléfono, un video horizontal visto en vertical los deja ilegibles (subjetivo hasta saber el formato de publicación) |
| A10 | El letrero de altitud tapa parte del encuadre en el primer plano | `juliane_caida.html:41` | Muestras de 7.0 a 8.5 s |

Lo que sí está bien: la cámara se mueve en 79 % de los cuadros (la referencia mide 65–80 %), hay cámara lenta de expresiones con rebote, pelo y vestido con resorte, y las transiciones por nube.

## 3. Qué mejoraría más, por impacto contra esfuerzo

1. **Sincronía desde la voz** (T4, T5, T10). Impacto alto, esfuerzo bajo-medio: los tiempos salen de `timeline.json` (palabra exacta) y la boca del volumen real. Es lo que más se nota y lo que más errores evita.
2. **Texto**: fuente incluida en el kit, subtítulos que parten renglón y con tamaño según el formato (T6, T7, A9). Impacto alto, esfuerzo bajo.
3. **Quitar parpadeos y destellos duros** (T2, T3): rampa de 3 a 4 cuadros en vez de estrobo. Impacto medio, esfuerzo mínimo.
4. **Color y luz por escena** (A1): un ajuste de color por toma con valores medidos (meta: brillo ≥ 0.40 en interiores) y luz con dirección. Impacto alto, esfuerzo medio.
5. **Personaje v3** (A2–A5): grosor de línea constante en pantalla, sombra propia y de contacto, cuello, extremidades curvas, parpadeo irregular, respiración visible, vista de tres cuartos. Es lo que más sube el nivel, y lo más caro: es rehacer `rig2.js`.
6. **Estructura** (T8, T9, T11–T13): un `historia.json` por video (formato, personajes, fondos, tiempos) y sacar el código viejo a un archivo aparte. Impacto en calidad percibida: nulo. Impacto en que cada historia nueva salga más rápido y con menos errores: alto.

## 4. Premisas que cuestiono

- **"Mejorar las animaciones del repo" no alcanza lo que buscas si los videos no están en el repo.** Diagnostiqué la escena de muestra, no los videos donde viste los detalles. Mientras cada video viva solo dentro de un chat, sus arreglos se pierden y los mismos defectos se repiten en el siguiente. Propuesta: cada video se guarda en `historias/videos/<titulo>/` (escena, guion, timeline y mezcla.py; el audio y los mp4 no).
- **Agregar más bibliotecas no es lo que falta.** En estos días entraron íconos, física, D3, música y estilos. Los defectos de arriba no se arreglan con ninguna: son de base (tiempos, texto, color, rig).
- **Un rig hecho con código tiene techo.** Para historias con personajes que cambian en cada video, el código es la opción correcta (barato y consistente). Pero no va a igualar animación dibujada a mano; la meta realista es "limpio, expresivo y sin errores", no "estudio de animación".
- **Horizontal o vertical se decide antes de tocar nada.** Las escenas están compuestas en horizontal y el índice dice vertical. Rehacer la composición después cuesta el doble.

## 5. Lo que no pude comprobar

- Los videos publicados (no están en el repo).
- El audio: la escena de muestra no trae voz ni mezcla, así que la sincronía la evalué leyendo el código.
- El render en la laptop con GPU (`KIT_GL=gpu`), que no cambié.
- `comun/medir_movimiento.py` reporta mal los segundos en videos de 24 fps (supone 30); el porcentaje de movimiento sí es válido. Es de `comun/`, fuera de historias: no lo toqué.

## 6. Cómo reproducir

```bash
mkdir v && cp historias/kit/escenas/juliane_caida.html v/escena.html && echo '{"bloques": [], "total": 19.6}' > v/timeline.json
python3 historias/kit/render.py paralelo v 2 && python3 historias/kit/render.py codificar v juliane.mp4
python3 historias/kit/revisa_auto.py v/juliane.mp4
```

## 7. Estado (16 nov 2026, tras el PR #1)
Hecho: render 8× más rápido (T1); utilería de 19 objetos con ocupantes recortados y colores fijos por historia, catálogo con prueba automática y guía `kit/UTILERIA.md` (resuelve los objetos "que intentan ser algo", los pies fuera de los objetos y el cambio de color entre escenas).

Pendiente, en este orden:
1. ~~Personaje v3~~ **Hecho (PR #2)**: `rig3.js`, `C.personaje3`. Queda pendiente dentro de este punto: perfil completo más fiel, manos con dedos para primeros planos y más peinados. Texto original:: cuello, manos con forma, sombra propia y de contacto, grosor de línea constante en pantalla, parpadeo irregular, respiración visible, vista de tres cuartos y de perfil; proporción de cabeza que no encoja los muebles. Validar con el catálogo de utilería (el muñeco de referencia) y en un tramo real.
2. **Hecho (PR #4)**: `alinear.py` (tiempo por palabra desde el mp3), `mod/voz.js` (`C.cuando`, `C.bocaVoz`, `C.hablaEn`, `C.subtitulos` en dos renglones, `C.destello` en rampa) y fuente Poppins dentro del kit. Medido con un audio real de 63 s: 171 de 171 palabras reconocidas, precisión de ±0.1 s por palabra (el modelo da instantes cada 0.08 s). Probé afinar los cortes con el volumen y empeoró, así que no se usa. Falta probarlo en una historia completa. Texto original: tiempos y boca desde la voz (`transcribir.py`, sin JSON de ElevenLabs), fuente incluida en el kit, subtítulos en dos renglones, sin estrobos (T2–T7, T10).
3. ~~Fondos~~ **Hecho (PR #3)**: `mod/fondos.js`, `C.lugar` con 6 lugares, 4 horas del día, capas con profundidad, luz que tiñe toda la toma y luces locales (`focos`). Queda pendiente dentro de este punto: más lugares según los pida cada historia (cabina de avión, selva, hospital, montaña) y lluvia. Texto original: fondos de interior y exterior con el mismo acabado que la utilería; color y luz por toma (A1, A6).
4. Limpieza: sacar personaje v1 y B a un archivo aparte, `historia.json` por video (T8–T13).
