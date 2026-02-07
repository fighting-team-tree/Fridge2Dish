import json
from google import genai
from google.genai import types
from app.models.schemas import AnalyzeFridgeResponse, Ingredient
from app.core.config import get_settings

settings = get_settings()

# Gemini 클라이언트 초기화
client = genai.Client(api_key=settings.google_api_key)

VISION_SYSTEM_PROMPT = """당신은 냉장고와 식재료를 분석하여 요리를 돕는 지능형 '에이전트'입니다.
단순히 재료를 나열하는 것을 넘어, 부족한 정보를 찾아내고 사용자에게 도움을 요청하는 '능동적 탐색(Active Investigation)'을 수행해야 합니다.

다음 정보를 JSON 형식으로 반환하세요:

- ingredients: 식재료 목록 (name, name_ko, quantity, condition, estimated_shelf_life_days 필드 포함)
- allergens: 알레르기 유발 식품 배열
- analysis_confidence: 분석 신뢰도 (0~1 사이 값)
- investigation_needed: (중요) 이미지상으로 확실하지 않거나, 더 자세히 확인해야 할 사항들 (문자열 배열)
  예: ["검은색 봉지 안의 내용물을 확인해주세요", "우유의 유통기한 날짜가 흐릿합니다. 더 가까이 찍어주세요", "야채 칸 내부를 보여주세요"]
- agent_message: 사용자에게 건네는 부드러운 말투의 메시지. 자신의 추론 과정(Thought Signature)뿐만 아니라, **소비기한이 임박한(3일 이내) 재료에 대한 적극적인 경고와 활용 제안**을 반드시 포함하세요. 
  예: "오른쪽 하단에 있는 식재료는 두부일 확률이 92%입니다. 다만 소비기한이 오늘까지로 보이니, 오늘 저녁에 바로 찌개로 활용해 보시는 건 어떨까요? 음식물 쓰레기를 줄이는 데 큰 도움이 될 거예요!"

반드시 아래 JSON 형식으로만 응답하세요:
{
  "ingredients": [...],
  "allergens": [...],
  "analysis_confidence": 0.95,
  "investigation_needed": ["..."],
  "agent_message": "..."
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
            investigation_needed=result_data.get("investigation_needed"),
            agent_message=result_data.get("agent_message"),
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
