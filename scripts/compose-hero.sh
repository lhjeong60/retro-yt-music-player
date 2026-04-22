#!/usr/bin/env bash
# 기존 docs/screenshot.png 을 1280x800 캔버스에 얹어 Chrome Web Store 용 히어로 이미지 생성
# 사용법: ./scripts/compose-hero.sh
# 결과물: dist/store-screenshot-1.png (1280x800)

set -euo pipefail
cd "$(dirname "$0")/.."

IN="docs/screenshot.png"
OUT_DIR="dist"
OUT="${OUT_DIR}/store-screenshot-1.png"

if [ ! -f "$IN" ]; then
  echo "ERROR: $IN not found" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# base64 embed (macOS base64 doesn't need -w 0)
B64=$(base64 < "$IN" | tr -d '\n')

# 원본 324x235 → 2x 스케일 (648x470) 중앙 배치
W=648
H=470
X=$(( (1280 - W) / 2 ))
Y=240  # 타이틀 공간 고려 상단 여백 확보

TMP_SVG=$(mktemp -t compose-hero.XXXXXX.svg)
trap 'rm -f "$TMP_SVG"' EXIT

cat > "$TMP_SVG" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" shape-rendering="crispEdges">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
    <linearGradient id="glow" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#0a4a0a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1280" height="800" fill="url(#bg)"/>
  <rect width="1280" height="800" fill="url(#glow)"/>

  <!-- scanline overlay -->
  <rect width="1280" height="800" fill="black" opacity="0.08" style="mask: url(#scans)"/>

  <text x="640" y="110" text-anchor="middle" fill="#39ff14"
        font-family="ui-monospace, Menlo, Monaco, 'Courier New', monospace"
        font-size="54" font-weight="bold" letter-spacing="4"
        style="filter: drop-shadow(0 0 8px rgba(57,255,20,0.6))">
    RETRO YT MUSIC PLAYER
  </text>
  <text x="640" y="150" text-anchor="middle" fill="#9a9a9a"
        font-family="ui-monospace, Menlo, Monaco, 'Courier New', monospace"
        font-size="20" letter-spacing="3">
    80s / 90s HI-FI SKIN FOR YOUTUBE MUSIC
  </text>

  <image href="data:image/png;base64,${B64}" x="${X}" y="${Y}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet" image-rendering="pixelated"/>
</svg>
EOF

rsvg-convert -w 1280 -h 800 "$TMP_SVG" -o "$OUT"

echo "✓ built $OUT"
sips -g pixelWidth -g pixelHeight "$OUT" | tail -2
