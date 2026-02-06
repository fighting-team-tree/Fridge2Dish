---
name: RecipeVision Prompt Engineering
description: RecipeVision AI 프롬프트 엔지니어링 가이드 - Gemini API 최적화
---

# RecipeVision 프롬프트 엔지니어링 가이드

> Gemini API 프롬프트 작성 및 최적화 가이드

---

## 프롬프트 위치

| 서비스 | 파일 | 프롬프트 변수 |
|--------|------|--------------|
| Vision | `services/vision.py` | `VISION_SYSTEM_PROMPT` |
| Recipe | `services/recipe.py` | `RECIPE_SYSTEM_PROMPT` |
| Image | `services/image.py` | `enhanced_prompt` (함수 내) |

---

## Vision 프롬프트 (식재료 인식)

### 현재 프롬프트 구조
```
1. 역할 정의: "냉장고와 식재료 이미지를 분석하는 전문가"
2. 출력 필드 명시: name, name_ko, quantity, condition, estimated_shelf_life_days
3. 추가 정보: allergens, analysis_confidence
4. JSON 형식 강제
```

### 최적화 팁
- 수량 추정 정확도 향상: "대략적인 수량을 g, 개, 팩 단위로"
- 한국어 우선: "한국에서 흔히 사용하는 식재료명으로"
- 신선도 판단: "외관으로 판단할 수 있는 상태만"

---

## Recipe 프롬프트 (레시피 생성)

### 현재 프롬프트 구조
```
1. 역할 정의: "요리 전문가이자 레시피 개발자"
2. 레시피 수: 3~5개
3. 출력 필드: id, title, title_ko, description, difficulty 등
4. completion_image_prompt: 이미지 생성용 상세 프롬프트 (영문, 50단어 이상)
```

### 최적화 팁
- 한국 가정식 우선: "한국 가정에서 쉽게 만들 수 있는"
- 난이도 균형: "쉬움 2개, 중간 2개, 어려움 1개 비율로"
- 재료 활용 최대화: "주어진 재료를 최대한 활용"

---

## Image 프롬프트 (음식 이미지)

### 현재 프롬프트 구조
```python
enhanced_prompt = f"""A professional food photography of {prompt}. 
The dish is beautifully plated on a clean white plate, with natural lighting from the side. 
The image should be appetizing, vibrant colors, high resolution, top-down or 45-degree angle view.
The food looks delicious and freshly cooked. Restaurant quality presentation."""
```

### 최적화 팁
- 한식 스타일: "Korean home-style presentation"
- 배경 다양화: "wooden table", "marble surface"
- 구도 지정: "overhead shot", "45-degree angle", "close-up"

---

## 프롬프트 테스트

### Vision 테스트
```bash
curl -X POST "http://localhost:8000/api/analyze-fridge" \
  -F "file=@test_fridge.jpg"
```

### Recipe 테스트
```python
# 특정 재료로 테스트
{
  "ingredients": [
    {"name": "chicken", "name_ko": "닭고기", "quantity": "500g"},
    {"name": "onion", "name_ko": "양파", "quantity": "2개"}
  ]
}
```

---

## 성능 최적화

| 항목 | 현재 | 목표 | 방법 |
|------|------|------|------|
| Vision 응답 | ~8초 | ≤5초 | 프롬프트 간소화, Flash 모델 |
| Recipe 응답 | ~5초 | ≤3초 | 출력 필드 최소화 |
| Image 생성 | ~15초 | ≤10초 | 해상도 조정 |

---

## 에이전트 사용 가이드

1. **프롬프트 수정 시**: 해당 서비스 파일의 프롬프트 변수 수정
2. **출력 형식 변경 시**: 프롬프트 + `schemas.py` 동시 수정
3. **새 AI 기능 추가 시**: `services/` 폴더에 새 서비스 파일 생성
4. **테스트 시**: curl 또는 샘플 데이터로 API 호출
