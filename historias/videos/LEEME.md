# Videos terminados

Una carpeta por historia: `historias/videos/<titulo>/`. Solo texto y código; nada de audio ni mp4.

- `escena.html`: la escena completa tal como se renderizó (render.py le inyecta el kit).
- `guion.md`: el guion con el que se hizo el video.
- `subs.json`: subtítulos alineados al audio: `[inicio, fin, texto]` en segundos.
- `fuentes/`: los scripts que la generan: escenas `.js`, `build_*.py` (arma escena.html), música y mezcla, alineación de subtítulos, reels verticales (`reels.py`/`capas.py`) y miniaturas (`mini.py`). Las rutas dentro de los scripts son las de /home/claude del chat donde se hizo; ajústalas al reutilizar.

| Carpeta | Video | Duración |
|---|---|---|
| ada-blackjack | Ada Blackjack (1921–1923) | 6:44 |
| larisa-savitskaya | Larisa Savitskaya, vuelo 811 (1981) | 5:23, 3 reels |
| angela-woodruff | Angela Woodruff y Kathleen Grundy, Hyde (1998–2000) | 5:10 horizontal + 4 reels verticales; Shipman siempre silueta plana |
| mary-anning | Mary Anning, Lyme Regis (1800–1848) | 6:18 horizontal + 4 reels verticales a pantalla completa (misma escena.html, se adapta al formato) |

Para no repetir personajes, fondos ni recursos, revisa aquí lo que ya se usó (busca con grep las funciones de dibujo en `fuentes/`).
