# Videos: kits de render

Un repo, dos proyectos separados. Cada uno solo usa su carpeta.

| Carpeta | Proyecto |
|---|---|
| `dato-puro/kit/` | Dato Puro (divulgación, videos verticales) |
| `historias/kit/` | Canal de historias animadas |

## Restaurar en un chat nuevo de Claude

Dato Puro:
```bash
git clone --depth 1 https://github.com/datopuro/Videos /home/claude/repo && ln -sfn /home/claude/repo/dato-puro/kit /home/claude/kit && bash /home/claude/kit/instalar.sh 2>&1 | tail -3
```

Historias:
```bash
git clone --depth 1 https://github.com/datopuro/Videos /home/claude/repo && ln -sfn /home/claude/repo/historias/kit /home/claude/kit
```

Al cambiar un kit, subir el cambio a su carpeta para que el siguiente chat baje la versión nueva.

## Tomar cosas del otro proyecto (lectura cruzada)

Cada proyecto puede mirar la carpeta del otro, **solo para leer**. Nunca se edita la carpeta ajena.

Cómo mirar sin gastar tokens:
1. Leer solo el `INDICE.md` del otro kit (una página). No abrir módulos ni ejemplos enteros.
2. Si algo sirve, buscar su firma con `grep -n "nombre" ../otra/kit/mod/x.js`.
3. Para usarlo: `cp` el módulo a la carpeta `mod/` propia (no reescribirlo por el chat), probarlo con una demo o muestras, y recién entonces subirlo a la carpeta propia.

Qué puede tomar cada uno (según lo que ya existe; confirmar en el INDICE de cada kit):
- `dato-puro/kit` ofrece a historias: `mod/transiciones.js` (9 transiciones 2D), `mod/graficas.js` (íconos, contadores, barras para datos curiosos dentro de una historia), `revisa_auto.py`, `mod/mapa.js` (si la historia ocurre en un lugar real), subtítulos de `kit.js`.
- `historias/kit` ofrece a dato-puro: `mod/caricatura.js` (personaje 2D con expresiones: sirve para temas de "cuerpo y mente" donde la persona 3D sin cara se queda corta), fondos por capas con paralaje, cámara 2D.

Reglas:
- Si dos kits tienen un archivo con el mismo nombre (`render.py`, `kit.js`, `prep.py`, `sfx.py`), NO se sobrescribe uno con otro: pueden ser versiones distintas. Se compara con `diff` y se avisa al usuario.
- Un arreglo que sirva a ambos (por ejemplo, un bug de `render.py`) se avisa al usuario para llevarlo a los dos.
- Cuando haya suficientes archivos idénticos, se mueven a `comun/` para mantener una sola copia.
