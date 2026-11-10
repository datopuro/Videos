#!/bin/bash
set -e
K="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$K/npm" && cd "$K/npm"
[ -f package.json ] || npm init -y >/dev/null
npm install --silent three@0.160.0 esbuild@0.20.2 world-atlas@2.0.2 topojson-client@3.1.0
cat > entrada.js <<'EOT'
import * as T from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
window.THREE = Object.assign({}, T, { EffectComposer, RenderPass, UnrealBloomPass, OutputPass, ShaderPass, RenderPixelatedPass, AfterimagePass, RoundedBoxGeometry, RoomEnvironment, TextGeometry, FontLoader, BufferGeometryUtils });
EOT
npx esbuild entrada.js --bundle --minify --format=iife --outfile="$K/three_plus.js" --log-level=warning
cp node_modules/three/examples/fonts/helvetiker_bold.typeface.json "$K/fuente.json"
node "$K/hacer_mapa.js"
python3 -c "import numpy, playwright" 2>/dev/null || pip install --break-system-packages -q numpy playwright
python3 -c "import PIL" 2>/dev/null || pip install --break-system-packages -q pillow
echo "kit listo en $K"
