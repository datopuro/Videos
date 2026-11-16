# Lecciones de "shorts-animados-claude" (resumen propio)

Fuente: https://github.com/luispablovillasenor-afk/shorts-animados-claude (MIT). Su motor es Remotion + three.js en TypeScript; aquí solo queda lo que aplica a nuestro kit. Para ver su código (personajes `toon.ts`, texturas pintadas `paint.ts`, contorno de tinta `ink.ts`): `git clone -q --depth 1 --filter=blob:none --sparse https://github.com/luispablovillasenor-afk/shorts-animados-claude /tmp/sac && git -C /tmp/sac sparse-checkout set plantillas/puente`, y leer solo el archivo que haga falta.

## Medidas de su canal de referencia (ver BIBLIA_DE_ESTILO.md)
- Voz pareja de 3.2 a 3.8 palabras por segundo en español, casi sin silencios; música y efectos 5 a 10 dB abajo; −14 LUFS.
- 0 o 1 corte duro por video: los cambios son movimientos continuos de cámara, destellos de 4 cuadros o fundidos de 6 a 8 cuadros al cambiar de lugar.
- Cámara en movimiento en 65–80 % de los cuadros (a veces tan lento que no se nota). Un tramo de 12 cuadros quieto ya parece trabado.
- Movimientos que arrancan rápido y frenan suave en 8 a 10 cuadros; deslizamientos de 18 a 40 cuadros; sacudidas en impactos que cambian de signo cada cuadro y se apagan en 7.
- Cada reacción en pantalla cae 0 a 3 cuadros antes de su palabra.
- Medir lo nuestro igual: `python3 /home/claude/repo/comun/medir_movimiento.py video.mp4 carpeta` (porcentaje de cuadros con cámara en movimiento, cortes, brillo, contraste, saturación). Ojo: en escenas planas sin textura puede no detectar el movimiento.

## Guion (fórmula que siguen sus 20 shorts)
Gancho = paradoja dicha como hecho, sin preparación → lugar y época en 1–2 frases → escalada de 3 a 6 momentos → momento de "espera… ¿qué?" → giro con frase fija ("Fíjate…") y comparación cotidiana → remate irónico; el video termina en la última palabra. Nunca describir con la voz lo que ya se está viendo.

## Imagen
- Personajes 2D planos con contorno delgado de color oscuro (no negro puro, ellos usan ciruela #241726), cabeza de frijol, adultos de 3.5 cabezas, parpadeo cada 0.5–2.3 s y sombra de contacto bajo los pies.
- Los personajes reciben la luz de la escena (no brillan solos). Luz principal cálida, sombras azul-violeta (nunca cafés); la luz cambia con la historia (mediodía → atardecer → noche).
- Desenfoque de fondo: primeros planos 12–16 px, planos medios 10–12, tomas abiertas 0. Enfoque en los ojos.
- Brillo mediano de día ≈0.57, sin negros aplastados, saturación alta. Sin grano de película.
- Efectos (fogonazos, polvo, líneas de velocidad, estrellas) planos, de caricatura.
- La primera versión siempre sale "bonita, de día de campo": si la historia es dura, que la luz y el lugar lo sean.

## Trampas que ellos ya pagaron
- Un ejército o multitud que termina dentro del cuadro se ve chico: que se salga por los lados.
- Una toma aérea muy alta se ve como ruido: cámara baja y alta detrás de un bando mirando al otro.
- Objetos a menos de ~2 m del lente se ven como manchas: revisar lo que pasa cerca de la cámara.
- Un arbusto cortado por la orilla parece "pelota verde": que se reconozca o que no esté.
- Un columpio con una sola cuerda que se pierde detrás del niño parece un ahorcado: siempre dos cuerdas.
- Revisar cámaras metidas dentro de casas y cosas tapando las caras antes del render.
- Banderas y objetos de época: los correctos para el lugar y el año.
