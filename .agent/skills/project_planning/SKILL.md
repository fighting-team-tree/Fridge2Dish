---
name: RecipeVision Project Planning
description: Fridge2Dish (RecipeVision) 프로젝트 기획 초안 - PRD, 개발 명세서, UI/UX Flow, PDCA, 기술 스택, MVP 우선순위
---

# RecipeVision (Fridge2Dish) 프로젝트 기획

> **한줄 정의**: 냉장고/식재료 사진만 올리면, 현재 가진 재료로 만들 수 있는 레시피와 완성 음식 이미지를 생성해 주는 멀티모달 AI 서비스.

---

## 📊 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | RecipeVision (Fridge2Dish) |
| **대회** | Gemini 3 Global Hackathon |
| **타깃 유저** | 20~40대 1~2인 가구, 자취/신혼/맞벌이 |
| **핵심 가치** | 냉장고 털이 + 음식 낭비 감소 |
| **차별점** | "레시피 검색"이 아닌 "내 냉장고 상태 기반 추천" |

---

## 🎯 핵심 강점 (왜 이 아이디어가 이길 수 있을까?)

| 요소 | 설명 |
|------|------|
| **Agentic Vision 활용** | Gemini 3의 NEW 기능을 핵심으로 활용 (Active Investigation 방식) |
| **완벽한 파이프라인** | Vision → LLM → Image Gen (멀티모달 완성) |
| **차별성** | 요리 과정 단계별 시각화 (기존 레시피앱과 다름) |
| **실용성** | 음식 낭비 감소 (실제 사회 임팩트) |
| **완성도** | 프로토타입 수준이 아닌 프로덕션 레디 |

---

## 1. PRD (Product Requirements Document)

### 1.1 목표 & 성공 지표

**해커톤 기준 목표 (MVP)**
- 냉장고 사진 1장 → **3개 이상의 레시피 + 각 레시피별 완성 이미지**까지 한 플로우에서 동작
- 평균 응답 시간: 30초 이내 (이미지 생성 포함, 1 레시피 선택 기준)

**성공 지표**
- 첫 사용자가 레시피 1개 이상 실제로 따라 해보고 "다시 쓰고 싶다"라고 답하는 비율 ≥ 60%
- 심사에서 "Gemini 3 기능 활용" 항목 평가 긍정 피드백 획득

### 1.2 주요 기능 범위 (MVP)

1. 냉장고 / 식재료 이미지 업로드
2. 이미지 기반 식재료 인식 (Gemini 3 Vision)
3. 인식된 재료 기반 레시피 후보 3~5개 생성 (Gemini 2.5 Pro)
4. 유저가 레시피 1개 선택
5. 선택 레시피에 대해:
   - 레시피 상세 (재료, 단계별 조리법, 예상 시간, 난이도, 영양 정보)
   - 완성 음식 이미지 1~2장 생성 (Imagen 3 or Gemini image)
6. 부가 기능 (가벼운 수준)
   - 알레르기/기피 재료 설정
   - 레시피 저장/즐겨찾기

### 1.3 Non-goals (이번 버전에서 하지 않을 것)

- 정교한 쇼핑 리스트, 추천 알고리즘, 소셜 기능
- 모든 단계의 요리 과정을 이미지로 "완전하게" 커버
- 모바일 네이티브 앱 (웹/Mobile Web로 충분)

---

## 2. 기술 스택 (Tech Stack)

### 2.1 권장 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| **Frontend** | Next.js + React + TypeScript + Tailwind | SSR/SEO, 이미지 최적화 |
| **Backend** | FastAPI (Python) | Gemini SDK, async 지원, 이미지 처리 |
| **AI - Vision** | `gemini-3-flash` | Agentic Vision |
| **AI - LLM** | `gemini-2.5-pro` | 구조화 레시피 생성 |
| **AI - Image** | `imagen-3.*` / `gemini-2.5-flash-image` | 완성 음식 이미지 |
| **DB** | Firestore (MVP) → PostgreSQL (향후) | 서버리스, 빠른 세팅 |
| **Storage** | Firebase Storage / S3 | 이미지 저장 |
| **Deploy** | Vercel (FE) + Cloud Run (BE) | 빠른 배포 |

### 2.2 AI 파트

```python
# 필요한 패키지
pip install google-genai pillow fastapi uvicorn
```

---

## 3. API 명세서 (Backend)

### 3.1 POST /api/analyze-fridge

**Input**: multipart form-data, `file` (이미지)

**Output**:
```json
{
  "ingredients": [
    {
      "name": "chicken breast",
      "quantity": "400g",
      "condition": "fresh",
      "estimated_shelf_life_days": 3
    }
  ],
  "allergens": ["egg"],
  "analysis_confidence": 0.92
}
```

### 3.2 POST /api/generate-recipes

**Input**:
```json
{
  "ingredients": [...],
  "preferences": {
    "avoid": ["pork"],
    "max_time_minutes": 40
  }
}
```

**Output**:
```json
{
  "recipes": [
    {
      "id": "r1",
      "title": "닭가슴살 데리야끼 덮밥",
      "difficulty": "중",
      "cooking_time_minutes": 25,
      "servings": 2,
      "ingredients": [...],
      "instructions": [...],
      "nutrition": {...},
      "completion_image_prompt": "..."
    }
  ]
}
```

### 3.3 POST /api/generate-food-images

**Input**:
```json
{
  "recipe_id": "r1",
  "prompt": "completion_image_prompt 문자열",
  "num_images": 1
}
```

**Output**:
```json
{
  "images": [
    { "url": "https://.../image1.jpg" }
  ]
}
```

### 3.4 품질/성능 요구사항

| API | 목표 응답 시간 |
|-----|----------------|
| `analyze-fridge` | 5~8초 이하 |
| `generate-recipes` | 5초 이하 |
| `generate-food-images` | 10~15초 |

---

## 4. UI/UX Flow

### 4.1 전체 유저 여정

```
[Home] → [분석 결과] → [레시피 리스트] → [레시피 상세] → [요리 모드]
   ↓          ↓              ↓              ↓
 사진 업로드   재료 확인/수정    3~5개 카드      텍스트+이미지
```

### 4.2 화면별 상세

#### A. 홈 / 사진 업로드
- Drag & Drop 영역 + "사진 업로드" 버튼
- 샘플 이미지로 체험하기 버튼 (데모용)

#### B. 분석 결과 (식재료 확인)
- 인식된 재료 리스트 (체크박스/태그 형태)
- 알레르기/기피 재료 설정 토글
- "레시피 추천 받기" 버튼

#### C. 레시피 리스트
- 레시피 카드들 (3~5개)
- 타이틀, 썸네일, 난이도, 조리시간, 주요 재료

#### D. 레시피 상세
- 완성 이미지 영역 + "이미지 생성" 버튼
- 재료 리스트
- 단계별 조리법
- 영양 정보

#### E. 요리 모드 (Step-by-step)
- 현재 단계 번호/총 단계 수
- 큰 텍스트 설명
- 이전/다음 버튼

---

## 5. MVP 기능 우선순위 (MoSCoW)

### ✅ Must Have (반드시 필요)

1. **이미지 업로드 + 기본 UI**
2. **식재료 인식 (Vision → JSON)**
3. **레시피 생성 (LLM 구조화)**
4. **레시피 선택 + 상세 화면**
5. **완성 음식 이미지 1장 생성**

### 👍 Should Have (있으면 좋음)

1. 재료 편집 UI
2. 기피 재료 / 알레르기 옵션
3. 레시피 메타 정보 (칼로리 등)
4. 레시피 저장 (즐겨찾기)
5. 완성 이미지 다중 생성 (2~4장)

### 💡 Could Have (시간 남으면)

1. 요리 과정 뷰 (텍스트 중심)
2. 스톡/프리 이미지 기반 조리 과정 예시
3. 다국어 지원 (ko/en)
4. 공유 기능

### ❌ Won't Have (이번 라운드에선 안 함)

1. 전체 단계 생성 이미지 시각화
2. 정교한 개인화 추천
3. 모바일 네이티브 앱
4. 소셜 기능

---

## 6. 개발 순서 (크리티컬 패스)

```
1. 이미지 업로드 UI + 백엔드 /analyze-fridge
         ↓
2. Vision → 재료 JSON 안정화
         ↓
3. /generate-recipes → 레시피 JSON 구조 확정
         ↓
4. 레시피 리스트/상세 화면 구현
         ↓
5. /generate-food-images → 한 장 생성까지
         ↓
   === 데모 가능한 MVP 완성 ===
         ↓
6. Should/Could에서 추가
```

---

## 7. PDCA 사이클

### Plan
- **문제**: 냉장고에 뭐가 있는지는 알지만, 뭘 해먹을지 모름
- **가설**: 냉장고 사진만으로 레시피 + 음식 이미지를 보여주면, 탐색/결정 시간 감소

### Do
- 백엔드 API 3개 + 프론트 end-to-end 구현
- 프롬프트/모델 튜닝

### Check
- 팀원/지인 5~10명 피드백
- 평균 응답 시간, 실패율 측정

### Act
- 인식 실패 케이스 → 프롬프트 강화
- 복잡한 레시피 → 제한 추가
- 이미지 불일치 → 프롬프트 상세화

---

## 8. 비용/품질 전략

### 이미지 생성 비용 관리

| 전략 | 설명 |
|------|------|
| **기본 플로우** | 완성 이미지 1~2장만 생성 |
| **옵션 플로우** | 사용자 요청 시에만 과정 이미지 추가 생성 |
| **캐싱** | 샘플 레시피 이미지 미리 생성해서 캐싱 |
| **콜라주** | 4단계를 모델로 4장 대신 1장 콜라주로 |

### 요리 과정 이미지 전략

- v1: **완성 이미지 1~2장** + 텍스트 레시피에 집중
- 과정 이미지: 옵션 / 특정 샘플에만 / 3~4단계 × 1장 최소화
- 발표: "미래 확장 기능 (Premium / Optional)"로 명시

---

## 9. 대회 제출 체크리스트

- [ ] 백엔드 (FastAPI) 3-4 엔드포인트
- [ ] 프론트엔드 (React) 최소 UI
- [ ] 실제 냉장고 사진 테스트 (3-5개)
- [ ] 생성 레시피 예제 (5-10개)
- [ ] 생성 이미지 갤러리 (20-40개)
- [ ] GitHub 저장소 (README 포함)
- [ ] 2-3분 데모 영상
- [ ] 5분 프레젠테이션 슬라이드

---

## 10. 서비스 이름 후보

| 카테고리 | 후보 |
|----------|------|
| **직관적** | Fridge2Dish, FridgeChef, CookMyFridge |
| **비전 강조** | RecipeVision, FridgeVision, VisionToDish |
| **한국어** | 냉장고요리사, 냉장GO, 오늘뭐먹지AI |

**추천**: **RecipeVision** (멀티모달, 비전 기반 핵심을 잘 드러냄)

---

## 에이전트 사용 가이드

이 스킬을 참조할 때:

1. **기능 구현 시**: API 명세서 + 데이터 모델 참고
2. **UI 개발 시**: UI/UX Flow 섹션 참고
3. **우선순위 결정 시**: MoSCoW 우선순위 확인
4. **개발 순서 결정 시**: 크리티컬 패스 참고
5. **비용 최적화 시**: 비용/품질 전략 섹션 참고
