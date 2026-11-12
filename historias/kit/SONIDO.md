# Efectos de sonido reales (Freesound)

`sfx.py` sintetiza sus sonidos. Para sonidos reales (papel, clic de un botón, golpe en un control, agua) se usa `sfx_buscar.py`, tomado de video-shotcraft (Apache-2.0). **Solo funciona donde hay red a freesound.org: en la laptop sí, en la nube de claude.ai no** (está bloqueado).

## Pasos
```bash
python kit/sfx_buscar.py search "dry paper slide" --max-duration 1 --limit 5
python kit/sfx_buscar.py get 12345 67890 --out-dir <carpeta_video>/sfx
```
- `search` da JSON con id, título, autor, duración, descargas y calificación. No descarga.
- `get` vuelve a comprobar la licencia en la página del sonido, baja el mp3 de vista previa y escribe `sfx/audio-manifest.json` y `sfx/FREESOUND-CREDITS.md`. Guardar ese archivo de créditos con el video.
- Licencia por defecto: solo CC0. `--license by` acepta también CC BY (exige dar crédito en la descripción). Nunca BY-NC ni licencias desconocidas.
- En `mezcla.py`: `m.golpe(m.W(3, 'golpe'), m.archivo('sfx/fs-12345.mp3', 0.4))`. `golpe` pone el PICO del sonido en ese tiempo (no el inicio del archivo): un golpe con 0.3 s de silencio antes ya no suena tarde. `m.poner` sigue igual para ambientes o colas. `recorte=(ini, fin)` en segundos para quedarse con un trozo.
- `m.finalizar()` imprime al final la sonoridad integrada (LUFS) y el pico real del `mezcla.wav`. Revisar que el pico quede en −1.5 dBFS o menos; un número correcto no garantiza que suene bien.

## Cómo elegir (resumen de las reglas de video-shotcraft)
- Buscar por fuente y material, no por emoción: "plastic remote button click", "palm slap plastic", "battery drop on table", no "click" ni "impact".
- Antes de buscar, anotar: qué acción, material, duración (≤1 s para clics), si debe tener cola o no.
- Un solo golpe por archivo: evitar grabaciones con varias acciones salvo que se recorte una.
- Descargas y calificación ayudan a ordenar, pero manda que suene a lo que se ve. Muchas calificaciones con 4.4 valen más que pocas con 4.9.
- Evitar tonos sintéticos de notificación ("bleep", "confirmation tone") para acciones físicas.
- Dos ids distintos pueden ser el mismo sonido: si dos candidatos suenan igual, quedarse con uno.
- Escuchar o revisar la forma de onda antes de usarlo: el título no basta.

## Origen
Buscador y reglas de elección: video-shotcraft (Apache-2.0). Alineación al pico y medición con `ebur128=peak=true`: skill `sonido` de JustCarlos30/skills-videos-cortos (MIT).
