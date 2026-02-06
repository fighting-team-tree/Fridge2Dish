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
  calories?: number;
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
