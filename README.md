# 근로복지넷 · 나의 서류조회 (KRDS 기반 반응형 UI 시안)

KRDS(디지털정부서비스 UI/UX 가이드라인) v1.0.0 토큰을 기반으로, 근로복지넷에 맞게 확장한 **나의 서류조회** 화면입니다.
PC·태블릿·모바일 반응형이며, html.to.design으로 피그마에 가져오기 위한 캡처 모드를 포함합니다.

## 폴더 구조

```
├── index.html                 화면 마크업
├── css/style.css              KRDS 토큰 + 근로복지넷 확장 토큰, 반응형 스타일
├── js/app.js                  필터·탭·보완서류 첨부·모달 등 동작
├── tokens/kwn-extension-tokens.json   피그마용 확장 토큰 (KRDS primitive 참조)
└── .nojekyll                  GitHub Pages가 파일을 그대로 배포하도록 설정
```

빌드 과정이 없는 정적 파일입니다. `index.html`을 브라우저로 열면 바로 동작합니다.

## GitHub Pages 배포

1. 이 폴더의 파일을 저장소 **루트**에 올립니다.
2. 저장소 **Settings → Pages**로 이동합니다.
3. **Source**를 `Deploy from a branch`, 브랜치를 `main`, 폴더를 `/ (root)`로 선택하고 저장합니다.
4. 1~2분 뒤 `https://<계정명>.github.io/<저장소명>/` 주소로 접속됩니다.

## html.to.design으로 피그마에 가져오기

피그마에서 html.to.design 플러그인을 열고 **URL 가져오기**에 아래 주소를 넣습니다.
`?capture=1`을 붙이면 라이트 테마로 고정되고, 고정 헤더·하단 고정 바·토스트가 꺼져서 레이어가 깔끔하게 들어옵니다.

```
https://<계정명>.github.io/<저장소명>/?capture=1
```

뷰포트는 Desktop **1440**, Tablet **768**, Mobile **375**를 권장합니다.

### 상태별 캡처 주소

`&state=값`을 붙이면 버튼을 누르지 않아도 해당 상태로 열립니다.

| state 값 | 화면 |
|---|---|
| (없음) | 기본 화면 (보완 요청 + 목록) |
| `attached` | 보완서류 1개 첨부 |
| `ready` | 보완서류 모두 첨부, 제출 가능 |
| `done` | 제출 완료 |
| `detail` | 상세조회 모달 (모바일은 바텀시트) |
| `action` | '보완 필요' 필터 적용 |
| `empty` | 조회결과 없음 |
| `temp` | 임시저장 탭 |
| `menu` | 전체메뉴 드로어 |

예: `https://<계정명>.github.io/<저장소명>/?capture=1&state=detail`

## 디자인 토큰

| 구분 | 토큰 | KRDS 참조 |
|---|---|---|
| 브랜드 | brand/green, brand/blue | success/60, primary/60 |
| 주요 CTA | button/brand-fill, -hover | secondary/70, secondary/80 (KRDS 기본 primary/50 대신 기관 네이비) |
| 조치 필요 | status/action-text·surface·border | warning/60·5·20 |
| 진행 중 | status/progress-text·surface·border | primary/60·5·20 |
| 처리 완료 | status/done-text·surface·border | success/60·5·20 |

높이(32/40/48), 레이아웃 간격(left-contents 64, breadcrumb-h1 40/32 등), 타이포 스케일은 KRDS 파일의 `semantic`·`responsive` 변수 값을 따릅니다.

## 참고

- 기준일은 데모 일관성을 위해 `js/app.js`의 `TODAY`(2026-10-01)로 고정되어 있습니다. 실제 날짜를 쓰려면 `new Date()`로 바꾸세요.
- 신청번호, 요청 사유, 상담 전화번호 등은 예시 데이터입니다.
- 웹폰트는 Noto Sans KR을 쓰고, `Pretendard GOV`가 설치된 환경에서는 그 폰트가 우선 적용됩니다. 피그마로 가져온 뒤 Pretendard로 교체하고 KRDS 텍스트 스타일을 연결하세요.
- 이 화면은 UI 시안으로 실제 데이터·서버와 연결되어 있지 않습니다.
