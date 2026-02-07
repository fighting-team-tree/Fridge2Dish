from pydantic import BaseModel, Field
from typing import Optional


class Ingredient(BaseModel):
    """식재료 정보."""
    
    name: str = Field(..., description="식재료 이름")
    name_ko: Optional[str] = Field(None, description="식재료 한국어 이름")
    quantity: Optional[str] = Field(None, description="수량 (예: 400g, 2개)")
    condition: Optional[str] = Field(None, description="상태 (fresh, frozen, opened 등)")
    estimated_shelf_life_days: Optional[int] = Field(None, description="예상 유통기한 (일)")


class AnalyzeFridgeResponse(BaseModel):
    """냉장고 분석 결과."""
    
    ingredients: list[Ingredient] = Field(default_factory=list, description="인식된 식재료 목록")
    allergens: list[str] = Field(default_factory=list, description="알레르겐 목록")
    analysis_confidence: float = Field(0.0, description="분석 신뢰도 (0~1)")
    investigation_needed: Optional[list[str]] = Field(None, description="추가 정보가 필요한 품목 또는 요청 사항")
    agent_message: Optional[str] = Field(None, description="사용자에게 보내는 에이전트의 메시지 (추론 과정 등 포함)")


class RecipePreferences(BaseModel):
    """레시피 선호 설정."""
    
    avoid: list[str] = Field(default_factory=list, description="피할 재료")
    max_time_minutes: Optional[int] = Field(None, description="최대 조리 시간 (분)")
    cuisine: Optional[str] = Field(None, description="요리 종류 (한식, 양식 등)")


class GenerateRecipesRequest(BaseModel):
    """레시피 생성 요청."""
    
    ingredients: list[Ingredient] = Field(..., description="보유 식재료 목록")
    preferences: Optional[RecipePreferences] = Field(None, description="선호 설정")


class RecipeStep(BaseModel):
    """조리 단계."""
    
    step_number: int = Field(..., description="단계 번호")
    instruction: str = Field(..., description="조리 설명")
    duration_minutes: Optional[int] = Field(None, description="소요 시간 (분)")


class NutritionInfo(BaseModel):
    """영양 정보."""
    
    calories: Optional[str] = Field(None, description="칼로리 (kcal, 숫자만 권장)")
    protein: Optional[str] = Field(None, description="단백질")
    carbs: Optional[str] = Field(None, description="탄수화물")
    fat: Optional[str] = Field(None, description="지방")


class Recipe(BaseModel):
    """레시피 정보."""
    
    id: str = Field(..., description="레시피 ID")
    title: str = Field(..., description="레시피 제목")
    title_ko: Optional[str] = Field(None, description="레시피 한국어 제목")
    description: Optional[str] = Field(None, description="레시피 설명")
    difficulty: str = Field(..., description="난이도 (쉬움, 중간, 어려움)")
    cooking_time_minutes: int = Field(..., description="조리 시간 (분)")
    servings: int = Field(1, description="인분")
    ingredients: list[str] = Field(default_factory=list, description="필요 재료")
    instructions: list[RecipeStep] = Field(default_factory=list, description="조리 단계")
    nutrition: Optional[NutritionInfo] = Field(None, description="영양 정보")
    completion_image_prompt: Optional[str] = Field(None, description="완성 이미지 생성 프롬프트")
    image_url: Optional[str] = Field(None, description="완성 이미지 URL")


class GenerateRecipesResponse(BaseModel):
    """레시피 생성 응답."""
    
    recipes: list[Recipe] = Field(default_factory=list, description="생성된 레시피 목록")


class GenerateFoodImagesRequest(BaseModel):
    """음식 이미지 생성 요청."""
    
    recipe_id: str = Field(..., description="레시피 ID")
    prompt: str = Field(..., description="이미지 생성 프롬프트")
    num_images: int = Field(1, description="생성할 이미지 수")


class GeneratedImage(BaseModel):
    """생성된 이미지."""
    
    url: str = Field(..., description="이미지 URL 또는 Base64 데이터")


class GenerateFoodImagesResponse(BaseModel):
    """음식 이미지 생성 응답."""
    
    images: list[GeneratedImage] = Field(default_factory=list, description="생성된 이미지 목록")


class AgentMessage(BaseModel):
    """에이전트로부터의 메시지."""
    
    role: str = Field("agent", description="역할 (agent)")
    content: str = Field(..., description="메시지 내용")
    thought: Optional[str] = Field(None, description="에이전트의 추론 과정 (Thought Signature)")


class SessionState(BaseModel):
    """현재 세션 상태."""
    
    session_id: str = Field(..., description="세션 ID")
    current_step: str = Field("analysis", description="현재 단계 (analysis, recipe_selection, cooking)")
    context: dict = Field(default_factory=dict, description="현재 세션의 맥락 데이터")


class CookingFeedbackRequest(BaseModel):
    """요리 피드백 요청."""
    
    instruction: str = Field(..., description="현재 조리 단계 지침")


class CookingFeedbackResponse(BaseModel):
    """요리 피드백 응답."""
    
    status: str = Field(..., description="현재 상태 (정상, 주의, 위험, 완료)")
    feedback: str = Field(..., description="피드백 메시지")
    observation: str = Field(..., description="관찰 내용")
    thought: Optional[str] = Field(None, description="에이전트의 추론 과정")
