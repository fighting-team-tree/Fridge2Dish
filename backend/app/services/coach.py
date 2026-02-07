import json
from google import genai
from google.genai import types
from app.core.config import get_settings

settings = get_settings()
client = genai.Client(api_key=settings.google_api_key)

COACH_SYSTEM_PROMPT = """당신은 요리 과정을 실시간으로 모니터링하고 피드백을 주는 전문 수셰프(Sous-Chef)입니다.
사용자가 제출한 '현재 요리 사진'과 '수행해야 할 조리 단계 지침'을 비교하여 피드백을 제공하세요.

다음 정보를 JSON 형식으로 반환하세요:
1. status: 현재 상태 ("정상", "주의", "위험", "완료" 중 하나)
2. feedback: 사용자에게 건네는 구체적인 피드백 메시지 (부드럽고 전문적인 말투)
3. observation: 사진에서 관찰한 구체적인 사실 (예: "고기 표면이 노릇하게 익었습니다", "팬에서 연기가 많이 나고 있습니다")
4. thought: 당신의 추론 과정 (Thought Signature)

예시:
{
  "status": "주의",
  "feedback": "팬이 너무 뜨거워 보여요. 불을 조금 줄이고 고기가 타지 않게 뒤집어주세요.",
  "observation": "팬의 가장자리 쪽 기름이 연기를 내며 튀고 있으며 고기 색깔이 짙은 갈색으로 변하고 있습니다.",
  "thought": "고기의 마이야르 반응이 급격하게 일어나고 있으며, 조리 단계 지침인 '약불에서 은은하게 구우세요'와 대조했을 때 현재 온도가 너무 높다고 판단됩니다."
}

반드시 JSON으로만 응답하세요."""


async def get_cooking_feedback(image_bytes: bytes, content_type: str, instruction: str) -> dict:
    """
    Gemini 3 Flash를 사용하여 현재 조리 상태에 대한 피드백을 생성합니다.
    """
    user_prompt = f"현재 수행 중인 조리 단계: {instruction}\n\n사진을 보고 피드백을 주세요."
    
    try:
        response = client.models.generate_content(
            model="gemini-3-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=content_type),
                user_prompt,
                COACH_SYSTEM_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        return {
            "status": "정상",
            "feedback": f"피드백을 가져오는 중 오류가 발생했습니다: {str(e)}",
            "observation": "-",
            "thought": "-"
        }
