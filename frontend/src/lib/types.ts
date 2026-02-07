// Backend API Types

export interface Ingredient {
  name: string;
  name_ko?: string;
  quantity?: string;
  condition?: string;
  estimated_shelf_life_days?: number;
}

export interface AnalyzeFridgeResponse {
  ingredients: Ingredient[];
  allergens: string[];
  analysis_confidence: number;
  investigation_needed?: string[];
  agent_message?: string;
}

export interface AgentMessage {
  role: "agent";
  content: string;
  thought?: string;
}

export interface SessionState {
  session_id: string;
  current_step: "analysis" | "recipe_selection" | "cooking";
  context: Record<string, any>;
}

export interface RecipePreferences {
  avoid?: string[];
  max_time_minutes?: number;
  cuisine?: string;
}

export interface GenerateRecipesRequest {
  ingredients: Ingredient[];
  preferences?: RecipePreferences;
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
  duration_minutes?: number;
}

export interface NutritionInfo {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface Recipe {
  id: string;
  title: string;
  title_ko?: string;
  description?: string;
  difficulty: string;
  cooking_time_minutes: number;
  servings: number;
  ingredients: string[];
  instructions: RecipeStep[];
  nutrition?: NutritionInfo;
  completion_image_prompt?: string;
  image_url?: string;
}

export interface GenerateRecipesResponse {
  recipes: Recipe[];
}

export interface GenerateFoodImagesRequest {
  recipe_id: string;
  prompt: string;
  num_images?: number;
}

export interface GeneratedImage {
  url: string;
}

export interface GenerateFoodImagesResponse {
  images: GeneratedImage[];
}

export interface CookingFeedbackResponse {
  status: "정상" | "주의" | "위험" | "완료";
  feedback: string;
  observation: string;
  thought?: string;
}
