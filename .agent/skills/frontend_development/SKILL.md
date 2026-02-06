---
name: RecipeVision Frontend Development
description: RecipeVision Frontend 개발 가이드 - Next.js 16 + TypeScript + Tailwind
---

# RecipeVision Frontend 개발 가이드

> Frontend 개발 시 참조하는 가이드

---

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: React useState + sessionStorage

---

## 페이지 구조

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `src/app/page.tsx` | 홈 (이미지 업로드) |
| `/analyze` | `src/app/analyze/page.tsx` | 분석 결과 (재료 선택) |
| `/recipes` | `src/app/recipes/page.tsx` | 레시피 리스트 |
| `/recipe/[id]` | `src/app/recipe/[id]/page.tsx` | 레시피 상세 |

---

## 상태 관리

### sessionStorage 키

| 키 | 타입 | 설명 |
|----|------|------|
| `analyzeResult` | `AnalyzeFridgeResponse` | 분석 결과 |
| `recipesResult` | `GenerateRecipesResponse` | 레시피 목록 |
| `selectedRecipe` | `Recipe` | 선택된 레시피 |
| `selectedIngredients` | `Ingredient[]` | 선택된 재료 |

---

## API 클라이언트

```typescript
// src/lib/api.ts
import { analyzeFridge, generateRecipes, generateFoodImages } from "@/lib/api";

// 사용 예시
const result = await analyzeFridge(file);
const recipes = await generateRecipes({ ingredients: [...] });
const images = await generateFoodImages({ recipe_id, prompt });
```

---

## 디자인 시스템

### CSS 클래스

| 클래스 | 용도 |
|--------|------|
| `.glass-card` | Glassmorphism 카드 |
| `.btn-primary` | 주요 버튼 (에메랄드 그라데이션) |
| `.btn-secondary` | 보조 버튼 (투명 테두리) |
| `.upload-zone` | 업로드 영역 (점선 테두리) |
| `.recipe-card` | 레시피 카드 |
| `.tag` | 태그/뱃지 |
| `.spinner` | 로딩 스피너 |

### 색상 변수

```css
--primary: #10b981;      /* 에메랄드 */
--secondary: #6366f1;    /* 인디고 */
--accent: #f59e0b;       /* 앰버 */
--background: #0f0f0f;   /* 다크 배경 */
```

---

## 페이지 플로우

```
[홈] 이미지 업로드
    ↓ analyzeFridge()
[분석결과] 재료 확인/선택
    ↓ generateRecipes()
[레시피 리스트] 레시피 선택
    ↓
[레시피 상세] 이미지 생성
    ↓ generateFoodImages()
[완성 이미지 표시]
```

---

## 새 페이지 추가 시

1. `src/app/<경로>/page.tsx` 생성
2. `"use client"` 디렉티브 추가 (인터랙티브한 경우)
3. 필요시 `src/lib/types.ts`에 타입 추가
4. 상태 전달은 sessionStorage 사용

---

## 에이전트 사용 가이드

1. **UI 수정 시**: `src/app/` 폴더의 해당 페이지 수정
2. **스타일 추가 시**: `globals.css`에 클래스 추가
3. **API 타입 변경 시**: `src/lib/types.ts` 수정
4. **새 API 연동 시**: `src/lib/api.ts`에 함수 추가
