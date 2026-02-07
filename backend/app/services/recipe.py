import json
import uuid
from google import genai
from google.genai import types
from app.models.schemas import (
    Ingredient,
    RecipePreferences,
    GenerateRecipesResponse,
    Recipe,
    RecipeStep,
    NutritionInfo,
)
from app.core.config import get_settings

settings = get_settings()
client = genai.Client(api_key=settings.google_api_key)

RECIPE_SYSTEM_PROMPT = """당신은 요리 전문가이자 레시피 개발자입니다.
주어진 식재료 목록을 기반으로 만들 수 있는 레시피 3~5개를 생성해주세요.

각 레시피에 대해 아래 정보를 포함해주세요:
- id: 고유 ID (예: "r1", "r2")
- title: 영문 레시피명
- title_ko: 한국어 레시피명
- description: 간단한 설명 (1~2문장)
- difficulty: 난이도 ("쉬움", "중간", "어려움" 중 하나)
- cooking_time_minutes: 조리 시간 (분)
- servings: 인분 수
- ingredients: 필요한 재료 목록 (문자열 배열)
- instructions: 조리 단계 (step_number, instruction, duration_minutes 포함)
- nutrition: 영양 정보 (calories는 숫자만, protein, carbs, fat 포함)
- completion_image_prompt: 완성된 음식 이미지 생성용 상세 프롬프트 (영문, 50단어 이상)

반드시 아래 JSON 형식으로만 응답하세요:
{
  "recipes": [...]
}"""


async def generate_recipes(
    ingredients: list[Ingredient],
    preferences: RecipePreferences | None = None,
) -> GenerateRecipesResponse:
    """
    Gemini 2.5 Pro를 사용하여 식재료 기반 레시피를 생성합니다.
    """
    # 재료 목록 문자열로 변환
    ingredient_list = ", ".join([
        f"{ing.name_ko or ing.name} ({ing.quantity or '적당량'})"
        for ing in ingredients
    ])
    
    # 선호 설정 문자열 생성
    preference_text = ""
    if preferences:
        if preferences.avoid:
            preference_text += f"\n피해야 할 재료: {', '.join(preferences.avoid)}"
        if preferences.max_time_minutes:
            preference_text += f"\n최대 조리 시간: {preferences.max_time_minutes}분"
        if preferences.cuisine:
            preference_text += f"\n요리 종류: {preferences.cuisine}"
    
    user_prompt = f"""보유 식재료: {ingredient_list}
{preference_text}

위 재료들로 만들 수 있는 맛있는 레시피 3~5개를 추천해주세요."""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=RECIPE_SYSTEM_PROMPT + "\n\n" + user_prompt)],
                ),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        result_data = json.loads(response.text)
        
        # Recipe 객체로 변환
        recipes = []
        for i, recipe_data in enumerate(result_data.get("recipes", [])):
            # 조리 단계 변환
            instructions = [
                RecipeStep(**step) for step in recipe_data.get("instructions", [])
            ]
            
            # 영양 정보 변환 (AI 응답이 int 또는 str일 수 있으므로 모두 문자열로 변환)
            nutrition = None
            if recipe_data.get("nutrition"):
                nutrition_raw = recipe_data["nutrition"]
                nutrition = NutritionInfo(
                    calories=str(nutrition_raw.get("calories")) if nutrition_raw.get("calories") is not None else None,
                    protein=str(nutrition_raw.get("protein")) if nutrition_raw.get("protein") else None,
                    carbs=str(nutrition_raw.get("carbs")) if nutrition_raw.get("carbs") else None,
                    fat=str(nutrition_raw.get("fat")) if nutrition_raw.get("fat") else None,
                )
            
            recipe = Recipe(
                id=recipe_data.get("id", f"r{i+1}"),
                title=recipe_data.get("title", ""),
                title_ko=recipe_data.get("title_ko"),
                description=recipe_data.get("description"),
                difficulty=recipe_data.get("difficulty", "중간"),
                cooking_time_minutes=recipe_data.get("cooking_time_minutes", 30),
                servings=recipe_data.get("servings", 2),
                ingredients=recipe_data.get("ingredients", []),
                instructions=instructions,
                nutrition=nutrition,
                completion_image_prompt=recipe_data.get("completion_image_prompt"),
            )
            recipes.append(recipe)
        
        return GenerateRecipesResponse(recipes=recipes)
        
    except json.JSONDecodeError:
        return GenerateRecipesResponse(recipes=[])
    except Exception as e:
        raise Exception(f"레시피 생성 중 오류 발생: {str(e)}")
