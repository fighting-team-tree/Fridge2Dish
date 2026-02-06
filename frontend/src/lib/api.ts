import {
  AnalyzeFridgeResponse,
  GenerateRecipesRequest,
  GenerateRecipesResponse,
  GenerateFoodImagesRequest,
  GenerateFoodImagesResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * 냉장고/식재료 이미지를 분석하여 식재료 목록을 반환합니다.
 */
export async function analyzeFridge(file: File): Promise<AnalyzeFridgeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze-fridge`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`분석 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 식재료 목록을 기반으로 레시피를 생성합니다.
 */
export async function generateRecipes(
  request: GenerateRecipesRequest
): Promise<GenerateRecipesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`레시피 생성 실패: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 레시피에 대한 완성 음식 이미지를 생성합니다.
 */
export async function generateFoodImages(
  request: GenerateFoodImagesRequest
): Promise<GenerateFoodImagesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-food-images`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`이미지 생성 실패: ${response.statusText}`);
  }

  return response.json();
}
