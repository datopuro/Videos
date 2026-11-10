import os
import shutil
import subprocess
import sys

K = os.path.dirname(os.path.abspath(__file__))
N = os.path.join(K, "npm")
ENTRADA = """import * as T from 'three';
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
"""


def correr(cmd, cwd=None):
    print(">", cmd, flush=True)
    subprocess.run(cmd, cwd=cwd, shell=True, check=True)


os.makedirs(N, exist_ok=True)
if not os.path.exists(os.path.join(N, "package.json")):
    correr("npm init -y", N)
correr("npm install --silent three@0.160.0 esbuild@0.20.2 world-atlas@2.0.2 topojson-client@3.1.0", N)
open(os.path.join(N, "entrada.js"), "w", encoding="utf-8").write(ENTRADA)
correr(f'npx esbuild entrada.js --bundle --minify --format=iife --outfile="{os.path.join(K, "three_plus.js")}" --log-level=warning', N)
shutil.copy(os.path.join(N, "node_modules", "three", "examples", "fonts", "helvetiker_bold.typeface.json"), os.path.join(K, "fuente.json"))
correr(f'node "{os.path.join(K, "hacer_mapa.js")}"')
correr(f'"{sys.executable}" -m pip install -q numpy playwright pillow')
correr(f'"{sys.executable}" -m playwright install chromium')
for p in ("ffmpeg", "ffprobe", "node", "npm"):
    print(p, "OK" if shutil.which(p) else "FALTA")
print("kit listo en", K)
