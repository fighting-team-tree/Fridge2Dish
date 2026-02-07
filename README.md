# RecipeVision: Interactive AI Kitchen Agent

냉장고 사진 한 장으로 시작하는 똑똑한 요리 생활. Gemini 3 기반의 대화형 AI 주방 에이전트입니다.

---

## 🚀 주요 기능
- **Active Investigation**: AI가 사진 분석 중 부족한 정보를 사용자에게 직접 요청 (능동적 탐색)
- **Cooking Coach**: 조리 과정을 실시간으로 모니터링하고 시각적 피드백 제공
- **Zero-Waste**: 소비기한 임박 재료 우선 활용 제안 및 D-Day 관리
- **Thought Signature**: AI의 판단 근거와 추론 과정을 투명하게 공개

## 🛠 기술 스택
- **Backend**: Python 3.12, FastAPI, `uv` (Package Manager)
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **AI**: Google Gemini 3 Flash (Vision/Coaching), Gemini 2.5 Pro (Recipe), Imagen 3 (Food Imaging)

---

## ⚙️ 실행 방법 (Local Development)

### 1. 환경 변수 설정
`backend` 폴더와 `frontend` 폴더에 각각 필요한 API 키를 설정해야 합니다.

**Backend (`backend/.env`):**
```env
GOOGLE_API_KEY=your_gemini_api_key
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. 백엔드(Backend) 실행
백엔드는 `uv`를 사용하여 실행합니다. (Python 3.12 권장)

```bash
cd backend
uv sync  # 의존성 설치
uv run uvicorn app.main:app --reload --port 8000
```

### 3. 프론트엔드(Frontend) 실행
```bash
cd frontend
npm install  # 패키지 설치
npm run dev
```

---

## 📂 프로젝트 구조
- `backend/`: FastAPI 기반 AI 서비스 로직 및 API 엔드포인트
- `frontend/`: Next.js 기반 인터랙티브 UI (에이전트 페르소나 적용)
- `.agent/`: 프로젝트 규칙 및 에이전트 설정 파일

## 📄 라이선스
MIT License