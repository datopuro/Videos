# comun/: herramientas que usan los dos canales

Ningún chat las lee enteras: se usan con los comandos de abajo. Están en el repo que ya se clona para restaurar el kit (`/home/claude/repo/comun/`; en la laptop, la carpeta `comun` del repo clonado).

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

## Créditos
- `lectura.py` adapta la regla y el método de `core/render/readcheck.mjs` y `musica/core/audio/`, `musica/tools/` son copia de lemo-opuscar (Lemomo / LemoLab), código MIT: https://github.com/lemomo-ai/lemo-opuscar — licencia en `musica/LICENSE-MIT-lemo-opuscar.txt`.
- Instrumentos: Versilian Studios (VSCO 2 CE, VCSL, CC0), FreePats y Karoryfer (CC0), Salamander Grand Piano (CC BY 3.0).
