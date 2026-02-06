import json
from google import genai
from google.genai import types
from app.models.schemas import AnalyzeFridgeResponse, Ingredient
from app.core.config import get_settings

settings = get_settings()

# Gemini 클라이언트 초기화
client = genai.Client(api_key=settings.google_api_key)

VISION_SYSTEM_PROMPT = """당신은 냉장고와 식재료 이미지를 분석하는 전문가입니다.
주어진 이미지에서 식재료를 식별하고, 각 재료에 대해 다음 정보를 JSON 형식으로 반환해주세요:

- name: 식재료 영문명
- name_ko: 식재료 한국어명
- quantity: 예상 수량 (예: "400g", "2개", "1팩")
- condition: 상태 (fresh, frozen, opened, sealed 중 하나)
- estimated_shelf_life_days: 예상 남은 유통기한 (일 단위, 정수)

또한 알레르기 유발 식품이 있다면 allergens 배열에 포함해주세요.
분석 신뢰도를 0~1 사이 값으로 analysis_confidence에 포함해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "ingredients": [...],
  "allergens": [...],
  "analysis_confidence": 0.95
}"""


async def analyze_fridge_image(image_bytes: bytes, content_type: str) -> AnalyzeFridgeResponse:
    """
    Gemini 3 Flash Vision을 사용하여 냉장고/식재료 이미지를 분석합니다.
    """
    try:
        response = client.models.generate_content(
            model="gemini-3-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=content_type),
                VISION_SYSTEM_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        # JSON 파싱
        result_text = response.text
        result_data = json.loads(result_text)
        
        # Pydantic 모델로 변환
        ingredients = [Ingredient(**ing) for ing in result_data.get("ingredients", [])]
        
        return AnalyzeFridgeResponse(
            ingredients=ingredients,
            allergens=result_data.get("allergens", []),
            analysis_confidence=result_data.get("analysis_confidence", 0.0),
        )
        
    except json.JSONDecodeError as e:
        # JSON 파싱 실패 시 빈 결과 반환
        return AnalyzeFridgeResponse(
            ingredients=[],
            allergens=[],
            analysis_confidence=0.0,
        )
    except Exception as e:
        raise Exception(f"이미지 분석 중 오류 발생: {str(e)}")
