---
name: RecipeVision API Development
description: RecipeVision Backend API 개발 가이드 - FastAPI + Gemini API 통합
---

# RecipeVision API 개발 가이드

> Backend API 개발 시 참조하는 가이드

---

## API 엔드포인트 명세

| 엔드포인트 | 메서드 | 설명 | 응답 시간 목표 |
|-----------|--------|------|---------------|
| `/api/analyze-fridge` | POST | 이미지 → 식재료 JSON | 5~8초 |
| `/api/generate-recipes` | POST | 재료 → 레시피 3~5개 | 5초 |
| `/api/generate-food-images` | POST | 프롬프트 → 음식 이미지 | 10~15초 |
| `/health` | GET | 헬스체크 | 즉시 |

---

## Gemini API 모델 사용

### Vision (식재료 인식)
```python
# gemini-3-flash 사용
model = "gemini-3-flash"
# 이미지 + 텍스트 프롬프트 전송
# JSON 응답 형식 지정: response_mime_type="application/json"
```

### Recipe Generation (레시피 생성)
```python
# gemini-2.5-pro 사용
model = "gemini-2.5-pro"
# 구조화된 레시피 JSON 출력
```

### Image Generation (음식 이미지)
```python
# gemini-2.5-flash-preview-image-generation 사용
model = "gemini-2.5-flash-preview-image-generation"
config = GenerateContentConfig(response_modalities=["TEXT", "IMAGE"])
```

---

## 스키마 구조

### Ingredient
```python
class Ingredient(BaseModel):
    name: str           # 영문명
    name_ko: str | None # 한국어명
    quantity: str | None
    condition: str | None
    estimated_shelf_life_days: int | None
```

### Recipe
```python
class Recipe(BaseModel):
    id: str
    title: str
    title_ko: str | None
    difficulty: str     # 쉬움, 중간, 어려움
    cooking_time_minutes: int
    servings: int
    ingredients: list[str]
    instructions: list[RecipeStep]
    nutrition: NutritionInfo | None
    completion_image_prompt: str | None
```

---

## 새 API 추가 시

1. `app/models/schemas.py`에 Request/Response 스키마 정의
2. `app/api/routes.py`에 엔드포인트 추가
3. 필요시 `app/services/`에 서비스 로직 구현
4. CORS 설정 확인 (`app/main.py`)

---

## 에이전트 사용 가이드

1. **API 수정 시**: `routes.py` 참조
2. **스키마 변경 시**: `schemas.py` 수정 후 Frontend `types.ts`도 동기화
3. **Gemini API 변경 시**: `services/` 폴더의 해당 파일 수정
4. **새 의존성 추가 시**: `uv add <패키지>`
