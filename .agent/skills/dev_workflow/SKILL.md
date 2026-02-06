---
name: RecipeVision Development Workflow
description: RecipeVision 프로젝트 개발, 실행, 테스트 방법 가이드
---

# RecipeVision 개발 워크플로우

> RecipeVision 프로젝트의 개발 환경 설정 및 실행 방법

---

## 프로젝트 구조

```
Fridge2Dish/
├── backend/                 # FastAPI (Python 3.12 + uv)
│   ├── app/
│   │   ├── main.py         # 앱 엔트리포인트
│   │   ├── api/routes.py   # API 라우트
│   │   ├── services/       # AI 서비스 (vision, recipe, image)
│   │   └── models/schemas.py
│   ├── pyproject.toml      # uv 의존성
│   └── .env                # 환경 변수
├── frontend/               # Next.js 16 + TypeScript
│   ├── src/app/           # 페이지 컴포넌트
│   ├── src/lib/           # 타입, API 클라이언트
│   └── .env.local         # 환경 변수
└── .agent/skills/         # 에이전트 스킬
```

---

## 개발 환경 설정

### 1. Backend 환경 설정

```bash
# .env 파일 생성
cd backend
echo "GOOGLE_API_KEY=your_api_key_here" > .env

# 의존성 설치
uv sync
```

### 2. Frontend 환경 설정

```bash
cd frontend
npm install
```

---

## 실행 명령어

### Backend 실행
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend 실행
```bash
cd frontend
npm run dev
```

### 동시 실행 (권장)
```bash
# 터미널 1: Backend
cd backend && uv run uvicorn app.main:app --reload

# 터미널 2: Frontend  
cd frontend && npm run dev
```

---

## 테스트

### API 테스트
```bash
# Health check
curl http://localhost:8000/health

# 이미지 분석 테스트
curl -X POST "http://localhost:8000/api/analyze-fridge" \
  -F "file=@sample_image.jpg"
```

### Frontend 빌드 테스트
```bash
cd frontend
npm run build
npm run lint
```

---

## 에이전트 사용 가이드

이 스킬을 참조할 때:

1. **프로젝트 실행 시**: 위 실행 명령어 사용
2. **의존성 추가 시**: Backend는 `uv add <패키지>`, Frontend는 `npm install <패키지>`
3. **환경 변수 확인 시**: `backend/.env`, `frontend/.env.local` 참고
4. **빌드 오류 해결 시**: 각 프레임워크 문서 참조
