# Chrome Web Store 스크린샷 가이드

## 규격 요구사항

- **크기**: 1280×800 (권장) 또는 640×400 — 반드시 둘 중 하나
- **형식**: PNG (24-bit, 알파 없음) 또는 JPEG
- **장수**: 최소 1장, 최대 5장
- **비율**: 정확히 8:5 — 비율 안 맞으면 업로드 거부

## 준비된 것 / 찍어야 할 것

### ✅ #1 — 히어로 (이미 생성됨)
`dist/store-screenshot-1.png` — 기존 `docs/screenshot.png`을 1280×800 레트로 배경에 올려 타이틀과 함께 제작. 바로 업로드 가능.

### 📸 #2 — YouTube Music 페이지 위 오버레이 (찍어야 함)
**목적**: "YTM 페이지 위에 이게 뜬다"는 걸 한 눈에 보여줌.

캡처 방법:
1. Chrome 창을 정확히 1280×800으로 리사이즈 — 아래 AppleScript 참고
2. `music.youtube.com` 열고 곡 재생
3. 확장 아이콘 클릭 → 레트로 플레이어 ON
4. `Cmd+Shift+4` 후 `Space`로 윈도우 캡처 (그림자 제외는 `Option` 누른 채 클릭)
5. 결과물이 정확히 1280×800인지 `sips -g pixelWidth -g pixelHeight <파일>`로 확인

### 📸 #3 — PiP 미니 플레이어 (킬러 기능)
**목적**: "다른 앱 위에 둥둥 뜨는 미니 플레이어"를 강조.

캡처 방법:
1. YTM에서 확장 켠 후, 레트로 패널의 `▭`(컴팩트) 버튼 클릭 → Document PiP 창 분리
2. 뒤에 코드 에디터나 브라우저 등 **다른 앱**을 띄움 (PiP 창이 그 위에 떠 있는 걸 보여주기 위함)
3. 전체 화면 캡처 (`Cmd+Shift+3`) → 결과물을 1280×800으로 크롭/리사이즈
4. 리사이즈 명령: `sips -z 800 1280 input.png --out output.png` (정확히 맞아야 함 → 크롭 필요할 수 있음)

### 📸 #4 — 컨트롤 클로즈업 (선택)
**목적**: 버튼/슬라이더 디테일 어필.

이미 생성된 `dist/store-screenshot-1.png`을 변형하거나, 레트로 패널만 크게 캡처해서 1280×800 캔버스에 올림.

### 📸 #5 — 설치 안내 (선택)
**목적**: 일회성 사이트 액세스 설정을 시각적으로.

`chrome://extensions` 세부정보 페이지의 "사이트 액세스" 섹션에 `music.youtube.com` 추가된 화면을 캡처. 리뷰어 설득용으로도 좋음.

---

## Chrome 창을 정확히 1280×800으로 만드는 법 (macOS)

### AppleScript 한 줄
```bash
osascript -e 'tell application "Google Chrome" to set bounds of front window to {100, 100, 1380, 900}'
```
(좌상단 100,100에서 시작해서 1280×800 크기)

### 또는 Chrome DevTools
1. `Cmd+Option+I`로 DevTools 열기
2. `Cmd+Shift+M`로 디바이스 툴바 토글
3. 상단 사이즈 드롭다운에서 `Responsive` 선택 → 너비 1280, 높이 800 입력
4. DevTools 닫지 않은 채로 페이지 캡처 (DevTools Protocol의 `Capture screenshot`: Command Menu `Cmd+Shift+P` → "Capture full size screenshot" 또는 "Capture screenshot")

후자가 정확한 1280×800 출력을 보장합니다 — 창 크기와 무관하게 뷰포트 기준.

---

## 크롭/리사이즈 헬퍼

임의 크기 캡처 → 1280×800 맞추기:

```bash
# 이미 비율이 8:5면 리사이즈만
sips -z 800 1280 input.png --out output-1280x800.png

# 비율이 다르면 중앙 크롭 후 리사이즈 (Preview.app에서 수동 크롭 추천)
```

---

## 파일 놓을 위치

제출용 이미지는 모두 `dist/` 아래 이름 붙여 저장:
- `dist/store-screenshot-1.png` (히어로 — 이미 있음)
- `dist/store-screenshot-2.png` (YTM 위 오버레이)
- `dist/store-screenshot-3.png` (PiP 미니 플레이어)
- `dist/store-screenshot-4.png` (선택)
- `dist/store-screenshot-5.png` (선택)

`dist/`는 `.gitignore`에 들어있어 커밋 안 되니 로컬에서만 유지하면 됨.

---

## 프로모 타일 (선택, 노출↑)

Chrome Web Store는 프로모 타일도 받습니다:
- **작은 타일**: 440×280 (스토어 리스팅 상단)
- **마키 타일**: 1400×560 (Featured 섹션용)

당장 필요 없고, 리스팅 관리 페이지에서 나중에 추가 가능.
