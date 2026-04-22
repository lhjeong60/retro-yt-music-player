#!/usr/bin/env bash
# Chrome Web Store 게시용 zip 패키징 스크립트
# 사용법: ./build.sh
# 결과물: dist/retro-yt-music-player-<version>.zip

set -euo pipefail

cd "$(dirname "$0")"

VERSION=$(node -p "require('./manifest.json').version" 2>/dev/null \
  || python3 -c "import json; print(json.load(open('manifest.json'))['version'])")

OUT_DIR="dist"
OUT_FILE="${OUT_DIR}/retro-yt-music-player-${VERSION}.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE"

FILES=(
  manifest.json
  background.js
  content.js
  main-world.js
  overlay.css
  icon16.png
  icon48.png
  icon128.png
)

for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: missing file '$f'" >&2
    exit 1
  fi
done

zip -q -X "$OUT_FILE" "${FILES[@]}"

echo "✓ built $OUT_FILE"
ls -la "$OUT_FILE"
echo ""
echo "contents:"
unzip -l "$OUT_FILE"
