# RecipeVision Backend

FastAPI 기반의 RecipeVision AI 서비스 백엔드입니다.

## 🛠 Tech Stack
- **Framework**: FastAPI
- **Package Manager**: [uv](https://github.com/astral-sh/uv)
- **AI Engine**: Google Gemini API (v3 Flash, v2.5 Pro)

## ⚙️ Setup & Execution

### 1. 환경 변수
`.env` 파일을 생성하고 Gemini API 키를 입력하세요.
```bash
GOOGLE_API_KEY=your_key_here
```

### 2. 실행
`uv`가 설치되어 있어야 합니다.
```bash
# 의존성 설치 및 가상환경 설정
uv sync

# 서버 실행
uv run uvicorn app.main:app --reload --port 8000
```

## 📡 API Endpoints
- `POST /api/analyze-fridge`: 냉장고 사진 분석 (능동적 탐색 포함)
- `POST /api/generate-recipes`: 재료 기반 레시피 생성
- `POST /api/generate-food-images`: 완성 음식 이미지 생성
- `POST /api/cooking-feedback`: 조리 과정 시각 피드백 (코칭 모드)
- `GET /health`: 서버 상태 확인
