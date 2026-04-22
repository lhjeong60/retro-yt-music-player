# Chrome 웹 스토어 리스팅 — 한국어

## 짧은 설명 (manifest.json — 이미 설정됨)

Retro stereo skin for YouTube Music. Green LCD, playback & volume controls, always-on-top mini player via PiP.

> manifest의 description은 영문으로 두는 게 전 세계 사용자에게 보여주기에 좋습니다. 한국어 상세 설명은 아래.

## 상세 설명

YouTube Music을 80–90년대 하이파이 스테레오로.

Retro YT Music Player는 music.youtube.com 위에 레트로 스테레오 기기 스킨을 오버레이합니다. 녹색 LCD 디스플레이, 금속 베젤 버튼, 믹서 페이더 스타일 볼륨 슬라이더로 80–90년대 오디오 기기의 감각을 재현합니다.

★ 주요 기능
• 녹색 인광 + 스캔라인 LCD 디스플레이
• 재생 제어 — 재생/일시정지, 이전/다음, 셔플, 반복(off/전체/한곡)
• 볼륨 페이더 — LED 레벨 바, 클릭/드래그/마우스 휠 지원, 0에서 자동 뮤트
• 프로그레스 바 — 원하는 지점 클릭으로 탐색
• 긴 곡명/아티스트는 마키(좌우 흐름) 애니메이션
• 드래그로 패널 위치 자유 이동
• 컴팩트 / 픽처인픽처 모드 — OS 레벨 항상 최상단 미니 창으로 분리, 다른 앱 위에서도 계속 보임 (Chrome 116+ 필요)
• 툴바 아이콘 On/Off 토글 — 페이지 새로고침이나 음악 끊김 없이
• 상태 저장 — 새로고침/재시작해도 유지

★ 동작 방식
music.youtube.com 페이지에 오버레이로 동작합니다. 페이지의 미디어 세션에서 현재 곡 정보를 읽고, YouTube Music 내부 플레이어 API로 재생/볼륨 명령을 전달하며, 상단에 레트로 UI를 그립니다. 오디오나 데이터가 브라우저 밖으로 나가지 않습니다.

★ 일회성 설정 (중요)
Chrome 사이트 액세스 정책상 한 번만 설정이 필요합니다:
1. chrome://extensions 열기
2. Retro YT Music Player의 "세부정보" 클릭
3. "사이트 액세스" 섹션에서 선택:
   - "특정 사이트에서" → https://music.youtube.com/* 추가 (권장)
   - 또는 "모든 사이트에서"
4. YouTube Music 탭 새로고침

이후로는 툴바 아이콘이 순수 On/Off 토글로 동작합니다 — 새로고침 팝업 없음, 음악 끊김 없음.

★ 개인정보
이 확장은 사용자 데이터를 수집, 전송, 저장하지 않습니다. 사용자가 연 music.youtube.com 페이지의 정보만 읽습니다.

★ 소스
GitHub 오픈소스: https://github.com/lhjeong60/retro-yt-music-player

---

## 단일 목적 (Single purpose)

이 확장의 단일 목적은 YouTube Music(music.youtube.com)에 레트로 스테레오 스타일의 대체 플레이어 스킨을 오버레이하여, 재생 제어 / 볼륨 제어 / 항상 최상단 분리형 미니 플레이어 기능을 제공하는 것입니다.

## 권한 사유

**scripting**
확장이 업데이트/리로드되거나 사용자가 툴바 아이콘을 눌러 오버레이를 토글할 때, 이미 열려있는 YouTube Music 탭에 content script를 재주입하기 위해 필요합니다. 사용자가 직접 탭을 새로고침하지 않아도 동작하게 해줍니다.

**storage**
레트로 플레이어의 On/Off 상태(boolean 하나)를 저장하여 페이지 새로고침이나 브라우저 재시작 후에도 동일 상태로 유지하기 위해 필요합니다.

**host_permissions: https://music.youtube.com/***
확장은 YouTube Music에서만 동작하며, 이 도메인 하나로만 접근을 한정하여 곡 메타데이터를 읽고 레트로 UI를 주입합니다. 다른 사이트에는 접근하지 않습니다.

## 사용자 데이터 미수집

개인정보 섹션에서 "사용자 데이터를 수집하지 않습니다" 체크.
확장이 다루는 대상은 오직 "웹사이트 콘텐츠"(YTM 페이지 DOM을 로컬에서만 읽음, 외부 전송 없음)라고 공개.
