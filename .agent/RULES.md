# RecipeVision 프로젝트 규칙

## 개발 환경
- Python: 3.12 + uv (pip 사용 금지)
- Node.js: npm 사용
- Frontend: Next.js 16 + TypeScript + Tailwind CSS

## 코드 스타일
- Python: PEP 8, 타입 힌트 필수
- TypeScript: ESLint 규칙 준수
- 한국어 주석 허용, 변수/함수명은 영문

## Git 규칙
- 커밋 메시지: `<type>(<scope>): <subject>` 형식
- 커밋 전 빌드 확인: `npm run build` (frontend), `uv sync` (backend)

## API 개발
- 모든 API는 `/api/` prefix 사용
- Request/Response는 Pydantic 스키마로 정의
- Frontend 타입과 Backend 스키마 동기화 필수

## 파일 구조
- Backend: `backend/app/` 내부에 코드 작성
- Frontend: `frontend/src/` 내부에 코드 작성
- 스킬 파일: `.agent/skills/<스킬명>/SKILL.md`

## 금지 사항
- 하드코딩된 API 키
- console.log 프로덕션 코드에 남기기
- 미사용 import/변수 방치

## 에이전트 구현 원칙 (Agentic Principles)
- **능동적 탐색 (Active Investigation)**: 정보가 부족할 때 추측하지 말고 사용자에게 추가 정보(사진 등)를 요청할 것.
- **실시간 코칭 (Real-time Coaching)**: 단순 텍스트 나열이 아닌, 사용자의 현재 진행 상태를 시각적으로 감지하고 피드백을 줄 것.
- **추론 과정 노출 (Thought Signatures)**: 결과만 보여주지 말고 AI가 왜 그렇게 판단했는지(예: "모양으로 보아 두부일 확률 85%")를 UI에 노출할 것.
- **사회적 임팩트 강조**: 식재료 낭비 방지(Food Waste) 및 환경적 가치를 항상 페르소나에 녹여낼 것.
