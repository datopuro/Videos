# Guía de referencia: canal de historias animadas (versión 2, 9 nov 2026)

> **Cómo leer este documento**: nada de lo que sigue es obligatorio. Es cómo lo armaría Claude a partir de lo que ya funciona en Dato Puro (render de canvas por cuadro, línea de tiempo desde la voz, mezcla con sfx.py, revisión de coherencia). En este proyecto, con cada escena y guion concretos en la mano, se evalúa qué conviene usar, cambiar o descartar. Si algo de aquí estorba, se ignora.

---

## 0. Punto de partida sugerido

- **Formato**: horizontal 1920×1080 a 24 fps, de 6 a 15 min. Además, recortes verticales de 30 a 60 s para Shorts y TikTok.
- **Personajes y fondos en código**: así cada historia puede tener personajes y lugares nuevos sin perder un estilo de canal reconocible.
- **Render**: página HTML con canvas 2D que define `renderAt(t)`, capturada por cuadro con Playwright y unida con ffmpeg. Es el mismo método que Dato Puro.
- **Estilo propio**: que no copie al personaje ni el look de ningún canal existente.

---

## 1. Herramientas públicas (verificadas 9 nov 2026)

### Motores y animación
| Herramienta | Para qué | Licencia | Opinión |
|---|---|---|---|
| Canvas 2D + Playwright + ffmpeg | Render exacto sincronizado con la voz | Propio | La opción con menos riesgo: ya está probada. |
| GSAP | Curvas de movimiento, líneas de tiempo, morfado de formas | Gratis incluso comercial, con todos los plugins (desde 2025) | Útil dentro de `renderAt(t)` con `timeline.seek(t)`. |
| Remotion | Videos en React por cuadro | Gratis para individuos y empresas de hasta 3 personas | Alternativa válida si se quieren componentes React y un estudio con vista previa. |
| Motion Canvas | Animación en TypeScript | MIT | No lo recomiendo: está sin mantenimiento. |
| Rive | Rig de personaje con huesos e IK | Runtimes MIT; editor gratis con limitaciones | Solo si algún día se quiere un rig hecho a mano. |

### Arte
- **No hay una biblioteca pública de personajes riggeados para animar por código** con un estilo coherente.
- **Open Peeps** (CC0): personas modulares, pero en poses fijas. Sirven de referencia o para extras de fondo.
- **Kenney** (CC0): props 2D y 3D, más audio.
- **Fondos CC0**: sí existen en itch.io y OpenGameArt (ciudades, interiores de terror, calles vectoriales). El problema es que cada paquete tiene su propio estilo (pixel art, anime, terror, plataformas). Algunos están hechos con IA, otros piden crédito aunque digan "free", y no cubren lugares específicos como "cocina de hamburguesería". Si se mezclan, cada video parece de otro canal. Sugerencia: usarlos solo si se encuentra uno vectorial con línea parecida a la del canal, o como referencia de composición.

### Sonido
| Fuente | Licencia | Uso |
|---|---|---|
| Kenney Audio | CC0 | Golpes, clics, pasos |
| Freesound | Por sonido; **filtrar CC0** | Puertas, ambiente, multitudes |
| YouTube Audio Library | Libre en YouTube; revisar si pide crédito | Música |
| Pixabay Music | Licencia propia | Música; algunas pistas generan reclamos de Content ID, así que hay que guardar el comprobante |

Sugerencia: llevar un `creditos.csv` con archivo, fuente, URL, licencia y fecha de descarga.

---

## 2. Lo que se reutilizaría del kit de Dato Puro

- **`transcribir.py` y `pausas.py`**: verificar que el mp3 corresponde al guion.
- **`prep.py`**: genera la línea de tiempo por frase y palabra. En videos largos es mejor usar `alineacion.json` de ElevenLabs, porque estimar por sílabas acumula error.
- **`render.py`**: cuadros, paralelo y codificar, con `KIT_GL=gpu` en la laptop.
- **`sfx.py` (`Mezcla`)**: queda igual, más *ducking* de música bajo la voz.
- **`revisa1fps.py` y `portadas.py`**: adaptados a 16:9.
- **Subtítulos**: en horizontal, como `.srt` aparte; quemados solo en los recortes verticales.

---

## 3. Personajes: generador con parámetros (sugerencia)

**Idea**: en vez de dibujar un personaje por historia, programar **un solo esqueleto** con expresiones y poses. Cada personaje nuevo es una "receta" de parámetros. Claude crea un personaje escribiendo una receta corta y todos se animan igual de bien.

### 3.1 El rig (se programa una vez)
- **Huesos**: cadera, columna, cuello, cabeza, brazo (2 segmentos) y pierna (2 segmentos) por lado. Ángulos en cadena (cinemática directa); IK de 2 huesos con ley de cosenos para pies apoyados y manos que agarran.
- **Cara** (es la mayor parte de la actuación):
  - ojos con posición de pupila y párpado de 0 a 1;
  - cejas con ángulo y altura;
  - boca interpolada entre formas.
- **Expresiones como presets mezclables**: neutral, feliz, triste, miedo, enojo, sorpresa, duda, cansado, asco, orgullo.
- **Poses y ciclos**:
  - poses: parado, sentado, señalar, brazos cruzados, encogido, manos en la cabeza, mirar el reloj, agacharse, cargar algo;
  - ciclos: caminar y correr.
- **Movimiento secundario automático**:
  - respiración;
  - parpadeo con semilla fija;
  - retraso de la cabeza respecto al cuerpo;
  - balanceo leve de pelo y ropa.
- **Boca con la voz**: apertura según la envolvente RMS de `voz.f32` (simple), o visemas desde las letras de `alineacion.json` (mejor).
- **Determinismo**: todo lo aleatorio con semilla, para que un cuadro vuelto a renderizar salga idéntico.

### 3.2 Catálogo de piezas (crece con cada historia)
- **Cuerpo**: estatura, complexión (delgado, medio, robusto), largo de piernas, tamaño de cabeza.
- **Cabeza**: redonda, ovalada, cuadrada, alargada.
- **Peinado**: lacio, rizado, rapado, coleta, chongo, calvo, fleco, afro, largo, etc. Arrancar con 10–15 y crecer.
- **Rasgos**: cejas (delgadas, gruesas, unidas), nariz (punto, línea, ninguna), lentes, barba, bigote, pecas.
- **Ropa superior**: playera, sudadera, camisa, saco, bata, uniforme genérico, chamarra, vestido.
- **Ropa inferior**: pantalón, short, falda, pants.
- **Calzado**: tenis, zapatos, botas.
- **Accesorios**: gorra, gorro, delantal, mochila, gafete, audífonos, reloj.
- **Edad aproximada**: niño, joven, adulto o mayor, cambiando proporciones (cabeza más grande en niños, postura encorvada en mayores) y canas.

### 3.3 Receta de ejemplo
```json
{
  "id": "mateo",
  "cuerpo": {"estatura": 1.0, "complexion": "delgado", "cabeza": "redonda", "edad": "joven"},
  "piel": "#f1d3b6",
  "pelo": {"estilo": "fleco", "color": "#3b2a20"},
  "cara": {"cejas": "gruesas", "nariz": "punto", "lentes": false},
  "ropa": {
    "arriba": {"tipo": "sudadera", "color": "#e2552f"},
    "abajo": {"tipo": "pantalon", "color": "#2b2f3a"},
    "pies": {"tipo": "tenis", "color": "#f5f5f5", "acento": "#e2552f"}
  },
  "accesorios": [{"tipo": "gorro", "color": "#4f7a8a"}],
  "rasgo": "camina encorvado",
  "voz_boca": "visemas"
}
```

### 3.4 Reglas de diseño sugeridas
- Cada personaje principal debe tener **silueta reconocible**: un color dominante y un accesorio. En plano general se debe distinguir sin ver la cara.
- Máximo 3 colores por personaje, más piel y línea.
- No copiar personajes ni uniformes de marcas o canales reales.
- Si la historia tiene extras (gente en el súper), generarlos con recetas aleatorias de semilla fija y en colores apagados para que no compitan con el protagonista.

---

## 4. Fondos: módulos que se combinan (sugerencia)

**Idea**: un juego de piezas en código con el mismo grosor de línea y la misma paleta. Claude compone cada lugar nuevo con piezas existentes y solo dibuja las que falten. Esas piezas quedan para siempre.

### 4.1 Estructura de un lugar
- **Capas con paralaje**: cielo o pared lejana (profundidad 0.2), fondo (0.5), plano del personaje (1.0) y frente que tapa (1.3).
- **Luz por hora**: mañana, tarde, atardecer, noche y luz artificial. Es un tinte por capa más una sombra plana bajo los objetos.
- **Anclas**: `suelo_y`, `puerta`, `mostrador`, etc., para colocar personajes y cámara.

### 4.2 Catálogo inicial de módulos
- **Estructura interior**: pared lisa, azulejo, ladrillo o papel tapiz; piso de madera, loseta o concreto; techo con lámparas; ventana; puerta; puerta automática; escalera.
- **Muebles y equipo**: mesa, silla, sillón, cama, librero, escritorio con computadora, refri, estufa, plancha de cocina, freidora, mostrador, caja registradora, estante con productos (procedural con semilla), banca, locker.
- **Exteriores**: calle con edificios (procedural), banqueta, estacionamiento, carretera, campo, bosque, desierto, playa, montaña, ciudad lejana.
- **Cielos**: día, nublado, atardecer, noche con estrellas, lluvia.
- **Señalética genérica**: letreros con texto inventado ("SUPER", "BURGER"). Nunca logos reales.

### 4.3 Receta de ejemplo
```json
{
  "id": "cocina_hamburgueseria",
  "hora": "noche_luz_artificial",
  "capas": {
    "fondo": [
      {"mod": "pared", "tipo": "azulejo", "color": "#e8e2d4"},
      {"mod": "campana_extractora", "x": 0.35},
      {"mod": "letrero", "texto": "PEDIDOS", "x": 0.75}
    ],
    "medio": [
      {"mod": "plancha", "x": 0.3},
      {"mod": "freidora", "x": 0.55},
      {"mod": "estante_metal", "x": 0.85, "semilla": 7}
    ],
    "frente": [{"mod": "mostrador", "x": 0.5, "alto": 0.25}]
  },
  "anclas": {"suelo_y": 0.86, "plancha": [0.3, 0.6]}
}
```

### 4.4 Plan B para lugares raros
Para escenarios fuera del catálogo (nave espacial, templo antiguo):
- Generar el fondo con IA, siempre con el mismo prompt de estilo, y Claude agrega paralaje, luz y personajes en código encima. Basta con que sea coherente dentro de esa historia.
- O tomar un fondo CC0 si su estilo encaja.

Lo sugiero como excepción, no como regla, por originalidad y por la política de YouTube contra el contenido inauténtico.

---

## 5. Cámara, transiciones y recursos (sugerencia)

- **Cámara 2D**: x, y, zoom, rotación y temblor.
  - Movimientos: plano fijo, paneo, acercamiento lento, *snap zoom* en remates, temblor en sustos.
  - Planos: general, medio, primer plano de cara y detalle.
- **Transiciones**: corte, fundido a negro, barrido, pantalla dividida (DÍA 1 / DÍA 30), rótulo de tiempo ("3 DÍAS DESPUÉS"), viñeta de pensamiento y flashback con tono sepia.

---

## 6. Guion con acotaciones (formato sugerido)

```
[PERSONAJES: mateo, cajera_01]
[LUGAR: super_entrada | mañana]
[MATEO: caminar → parado, cansado]
Llegué al súper a las ocho de la mañana, como siempre.
[CAM: acercar a cara | MATEO: duda]
Pero esa mañana algo estaba raro.
[SFX: puerta_automatica] [CAM: snap zoom puerta]
Las puertas se abrieron... y no había nadie.
```

Si el guion llega sin acotaciones, Claude las propone y se aprueban antes de animar. Si hay personajes nuevos, se proponen sus recetas con una hoja de prueba (frente, perfil y 4 expresiones) antes de usarlos.

---

## 7. `escenas.json` (ejemplo de cómo se podría describir cada toma)

```json
{
  "fps": 24, "ancho": 1920, "alto": 1080,
  "personajes": ["mateo", "cajera_01"],
  "tomas": [
    {
      "id": "T001",
      "frase": 1,
      "lugar": "super_entrada",
      "hora": "manana",
      "camara": {"plano": "general", "mov": "paneo", "de": [-200, 0, 1.0], "a": [0, 0, 1.1]},
      "actores": [
        {"id": "mateo", "x": 0.3, "accion": "caminar", "hasta": 0.55, "cara": "cansado", "mira": "der"}
      ],
      "extras": {"cantidad": 3, "semilla": 4},
      "texto": null,
      "sfx": [{"id": "pasos_suave", "palabra": "llegué"}],
      "musica": "calma_01",
      "transicion": "corte"
    }
  ]
}
```

- Los tiempos se resuelven contra `timeline.json` (frase o palabra), no se escriben a mano.
- Cada toma dura de 3 a 8 s; si una frase dura más, se parte cambiando de plano.

---

## 8. Flujo por video (como lo haría)

1. Recibir guion (idealmente con acotaciones), `voz.mp3` y `alineacion.json`.
2. Transcribir y comparar con el guion; si no coincide, avisar antes de animar.
3. Generar la línea de tiempo con `prep.py`.
4. Listar personajes y lugares de la historia: cuáles ya existen y cuáles hay que crear. Crear recetas y módulos nuevos y probarlos en una hoja.
5. Escribir `escenas.json` (de 120 a 180 tomas en 10 min), con el plano cambiando al menos cada 8 s.
6. Hacer una hoja de muestras (1 cuadro por toma, baja resolución) y una revisión de coherencia toma por toma.
7. Mezclar: voz, música con *ducking*, ambiente por lugar y efectos pegados a la palabra, a −14 LUFS.
8. Renderizar con GPU por tramos de 2 a 3 min (para poder corregir un tramo sin rehacer todo). Medir s/cuadro en el piloto.
9. Codificar con ffmpeg (libx264 crf 18, AAC 192 k) y generar el `.srt`.
10. Revisión final: hojas cada 3 s más todas las transiciones a 1 fps.
11. Sacar recortes verticales: 2 o 3 momentos fuertes, reencuadrados con la cámara virtual a 1080×1920 y con subtítulos quemados.
12. Hacer una miniatura con escena dedicada: expresión exagerada, 2 a 4 palabras grandes, contraste fuerte, probada a tamaño de móvil.

---

## 9. Sonido (criterios sugeridos)

- **Voz siempre arriba**: música de −18 a −22 dB bajo la voz y de −10 dB en silencios.
- **Ambiente**: uno por lugar, en bucle, cerca de −28 dB.
- **Efectos**: solo en acciones visibles o remates, sin saturar.
- **Antes de un giro**: de 0.5 a 1 s de silencio.
- **Música**: cambiar por acto (calma, tensión, resolución) con fundidos de 1 a 2 s.

---

## 10. Revisión de coherencia (heredada de Dato Puro)

Por toma:
- El personaje hace lo que dice la voz y su expresión corresponde a la emoción.
- Hay continuidad: misma ropa, mismo lado de pantalla entre cortes y objetos que no aparecen ni desaparecen solos.
- La física tiene sentido: pies en el suelo, manos que tocan lo que agarran, nada atravesando nada.
- Los textos en pantalla coinciden con el guion.
- No hay tomas vacías, casi negras ni con el personaje cortado sin intención.

---

## 11. Originalidad y plataforma

- **YouTube**: el 15 jul 2025 actualizó su política del Programa de Socios contra el contenido "inauténtico" (masivo, de plantilla, con variaciones mínimas). Lo que protege al canal es reescribir cada historia, variar la puesta en escena entre videos y tener personajes con identidad propia.
- **Historias de Reddit**: tomar la idea y reescribirla; cambiar nombres y detalles; no usar usuarios ni capturas.
- **Marcas y logos**: nada real; usar tiendas y uniformes genéricos.
- **Voz con IA**: declararla cuando aplique y poner "Voz generada con IA" en la descripción.

---

## 12. Orden de arranque sugerido

1. Definir el estilo del canal: paleta, grosor de línea y tipo de cabeza y ojos.
2. Programar el rig con expresiones y poses, y probarlo con 3 recetas distintas en una hoja.
3. Programar 10 a 15 módulos de fondo y armar 3 lugares.
4. Hacer un piloto de 60 a 90 s para medir el render y validar el estilo.
5. Hacer el primer video largo.

## Referencias

- GSAP gratis: https://webflow.com/blog/gsap-becomes-free
- Licencia de Remotion: https://www.remotion.dev/docs/license/faq
- Estado de Motion Canvas: https://hn.nuxt.dev/item/47155375
- Rive: https://rive.app/use-cases/character-animation
- Open Peeps (CC0): https://openpeeps.com
- Kenney (CC0): https://kenney.nl/assets/ui-audio
- Fondos CC0 en OpenGameArt: https://opengameart.org/content/cc0-backgrounds
- Ejemplo de fondos vectoriales CC0: https://jamiecross.itch.io/3-cityroad-backgrounds-free
- Ejemplo de fondos de terror CC0: https://the-outlander.itch.io/horror-backgrounds-scary-haunted-interior-free-cc0
- Fuentes de audio: https://app.cinevva.com/guides/free-sound-effects-music
- Política de YouTube: https://www.searchenginejournal.com/youtube-monetization-update-spam-not-reaction-channels/550755/
