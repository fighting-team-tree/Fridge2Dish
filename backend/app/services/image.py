import base64
from google import genai
from google.genai import types
from app.models.schemas import GenerateFoodImagesResponse, GeneratedImage
from app.core.config import get_settings

settings = get_settings()
client = genai.Client(api_key=settings.google_api_key)


async def generate_food_images(
    prompt: str,
    num_images: int = 1,
) -> GenerateFoodImagesResponse:
    """
    Imagen 3 또는 Gemini Image API를 사용하여 완성 음식 이미지를 생성합니다.
    """
    enhanced_prompt = f"""A professional food photography of {prompt}. 
The dish is beautifully plated on a clean white plate, with natural lighting from the side. 
The image should be appetizing, vibrant colors, high resolution, top-down or 45-degree angle view.
The food looks delicious and freshly cooked. Restaurant quality presentation."""

    images = []
    
    try:
        # Gemini 2.5 Flash Image Generation 사용
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-image-generation",
            contents=enhanced_prompt,
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            ),
        )
        
        # 응답에서 이미지 추출
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                # Base64 인코딩된 이미지 데이터
                image_data = base64.b64encode(part.inline_data.data).decode("utf-8")
                mime_type = part.inline_data.mime_type or "image/png"
                data_url = f"data:{mime_type};base64,{image_data}"
                images.append(GeneratedImage(url=data_url))
                
                if len(images) >= num_images:
                    break
        
        return GenerateFoodImagesResponse(images=images)
        
    except Exception as e:
        # 이미지 생성 실패 시 빈 결과 반환
        raise Exception(f"이미지 생성 중 오류 발생: {str(e)}")
