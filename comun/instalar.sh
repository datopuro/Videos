#!/bin/bash
set -e
C="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$C/npm" && cd "$C/npm"
[ -f package.json ] || npm init -y >/dev/null
[ -d node_modules/@tabler/icons ] || npm install --silent @tabler/icons@3.35.0 matter-js@0.20.0 d3@7.9.0 d3-sankey@0.12.3 esbuild@0.20.2
node "$C/fuentes/hacer_comun.js"
echo "comun listo en $C/mod"
