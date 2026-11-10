# Portadas (miniaturas) de Dato Puro (4 nov 2026)

## Problema
En Facebook el selector de fotogramas se saltó el fotograma que el usuario quería. Los selectores de portada de las redes ofrecen un conjunto limitado de cuadros del video y no siempre dejan elegir uno exacto. La solución es subir una imagen aparte (portada personalizada), no depender de elegir un cuadro dentro del video.

## Flujo (después de codificar el video, antes de entregar)
1. Al revisar las hojas de muestras se eligen 3–5 tiempos "vistosos": el momento del gancho (0–3 s), el pico visual del objeto protagonista, y una escena que explique el tema de un vistazo.
2. `python kit/portadas.py <carpeta-del-video> t1 t2 t3 ...` renderiza esos instantes a 1080×1920 con el mismo motor del video (respetar `KIT_GL` igual que en el render) y guarda JPG q95 en `<carpeta>/portadas/portada_<t>.jpg`. Por defecto OCULTA los subtítulos (`#cap`); `--subs` los deja.
3. Genera `portadas/hoja_guia.jpg`: las candidatas con la zona segura marcada. Oscurecido = fuera del cuadrado central 1080×1080 (y = 420–1500); líneas amarillas = recorte 3:4 de Instagram (y = 240–1680). Lo importante (protagonista y texto) debe quedar en la zona clara.
4. Se entrega 1 portada recomendada (más 1–2 alternas) junto con el mp4.

## Reglas
- Los subtítulos del kit viven en y≈1430, dentro del cuadrado central: por eso las portadas salen sin subtítulos.
- Si ningún cuadro funciona sola como portada, hacer una escena de portada dedicada (sin que forme parte del video) o usar Gemini con `instrucciones-gemini-miniaturas-dato-puro.md`.
- Texto en portada: solo si lo verificado lo respalda; 2–5 palabras. No inventar cifras.
- Los recortes de TikTok no están confirmados (según fuentes, cuadrado o ~3:4); por eso la regla del cuadrado central.
- YouTube Shorts: la miniatura no sale en el feed de Shorts; la subida personalizada puede depender del Programa de Socios y de escritorio (no confirmado oficialmente).
- Pendiente de confirmar: en qué redes sí se puede subir imagen personalizada para Reels/TikTok/Facebook desde el celular (el usuario lo probará).
