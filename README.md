# 학원四季사계 사이트 (hakwon-sagye.pages.dev)

| 경로 | 화면 |
|---|---|
| `/` | 웹헤더(첫 화면) |
| `/diagnosis/` | 학원 경영 진단 |
| `/tools/area/` · `/tools/verify/` · `/tools/pl/` · `/tools/open/` | 상권 리포트 · 검증표 · 손익 시트 · 개원 플래너 |

- 운영실·계약 서류·보고서 양식은 Claude 아티팩트(공유 저장소 필요)라 여기 없음 → 링크만 연결.
- 잠금: `functions/_middleware.js` — 쿠키 `sg_auth`(30일). `/__logout` 으로 나가기.
- 비밀번호: GitHub Secrets `SAGYE_SITE_PASSWORD` (대화창에 붙여넣지 않음). 없으면 503 '준비 중'.
- 공개 경로: GitHub Variables `SAGYE_PUBLIC_PATHS` (예: `/,/diagnosis/`) — 출시 때 웹헤더·진단만 공개.
- 원본: `src/` (*.src.html · shared/ · build.py). 화면 고칠 때 src 고치고 → build → dist 갱신 → push.
