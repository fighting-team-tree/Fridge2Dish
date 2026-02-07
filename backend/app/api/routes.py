from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models.schemas import (
    AnalyzeFridgeResponse,
    GenerateRecipesRequest,
    GenerateRecipesResponse,
    GenerateFoodImagesRequest,
    GenerateFoodImagesResponse,
    CookingFeedbackResponse,
)
from app.services.vision import analyze_fridge_image
from app.services.recipe import generate_recipes
from app.services.image import generate_food_images
from app.services.coach import get_cooking_feedback

router = APIRouter()


@router.post("/analyze-fridge", response_model=AnalyzeFridgeResponse)
async def analyze_fridge(file: UploadFile = File(...)):
    """
    냉장고/식재료 이미지를 분석하여 식재료 목록을 반환합니다.
    
    - **file**: 냉장고 또는 식재료 이미지 파일
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    image_bytes = await file.read()
    result = await analyze_fridge_image(image_bytes, file.content_type)
    return result


@router.post("/generate-recipes", response_model=GenerateRecipesResponse)
async def create_recipes(request: GenerateRecipesRequest):
    """
    식재료 목록을 기반으로 레시피를 생성합니다.
    
    - **ingredients**: 보유 식재료 목록
    - **preferences**: 선호 설정 (선택)
    """
    result = await generate_recipes(request.ingredients, request.preferences)
    return result


@router.post("/generate-food-images", response_model=GenerateFoodImagesResponse)
async def create_food_images(request: GenerateFoodImagesRequest):
    """
    레시피에 대한 완성 음식 이미지를 생성합니다.
    
    - **recipe_id**: 레시피 ID
    - **prompt**: 이미지 생성 프롬프트
    - **num_images**: 생성할 이미지 수 (기본값: 1)
    """
    result = await generate_food_images(request.prompt, request.num_images)
    return result


@router.post("/cooking-feedback", response_model=CookingFeedbackResponse)
async def cooking_feedback(
    file: UploadFile = File(...),
    instruction: str = Form(...)
):
    """
    현재 조리 상태에 대한 AI 피드백을 제공합니다.
    
    - **file**: 현재 조리 중인 사진
    - **instruction**: 현재 수행 중인 조리 단계 지침
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    
    image_bytes = await file.read()
    result = await get_cooking_feedback(image_bytes, file.content_type, instruction)
    return result
