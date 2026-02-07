"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { generateFoodImages } from "@/lib/api";
import { Recipe } from "@/lib/types";

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedRecipe");
    if (stored) {
      const parsed = JSON.parse(stored) as Recipe;
      setRecipe(parsed);
      // 이미 생성된 이미지가 있으면 사용
      if (parsed.image_url) {
        setGeneratedImage(parsed.image_url);
      }
    } else {
      router.push("/recipes");
    }
  }, [router]);

  const handleGenerateImage = useCallback(async () => {
    if (!recipe || !recipe.completion_image_prompt) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateFoodImages({
        recipe_id: recipe.id,
        prompt: recipe.completion_image_prompt,
        num_images: 1,
      });

      if (response.images.length > 0) {
        setGeneratedImage(response.images[0].url);
        
        // 레시피 객체 업데이트
        const updatedRecipe = { ...recipe, image_url: response.images[0].url };
        sessionStorage.setItem("selectedRecipe", JSON.stringify(updatedRecipe));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/recipes")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {recipe.title_ko || recipe.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="tag">{recipe.difficulty}</span>
            <span className="text-gray-400">⏱️ {recipe.cooking_time_minutes}분</span>
            <span className="text-gray-400">👥 {recipe.servings}인분</span>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="glass-card overflow-hidden mb-8">
        {generatedImage ? (
          <div className="aspect-video">
            <img
              src={generatedImage}
              alt={recipe.title_ko || recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-emerald-500/10 to-purple-500/10 flex flex-col items-center justify-center">
            {isGenerating ? (
              <>
                <div className="spinner w-16 h-16 mb-4" />
                <p className="text-lg font-medium">AI가 완성 이미지를 생성하고 있어요...</p>
                <p className="text-sm text-gray-400">약 10~15초 소요됩니다</p>
              </>
            ) : (
              <>
                <span className="text-6xl mb-4">🍽️</span>
                <button
                  onClick={handleGenerateImage}
                  className="btn-primary"
                  disabled={!recipe.completion_image_prompt}
                >
                  ✨ 완성 이미지 생성하기
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Description */}
      {recipe.description && (
        <div className="mb-8">
          <p className="text-lg text-gray-300">{recipe.description}</p>
        </div>
      )}

      {/* Ingredients */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🥗</span> 필요 재료
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {recipe.ingredients.map((ingredient, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>{ingredient}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>📖</span> 조리 순서
        </h2>
        <div className="space-y-6">
          {recipe.instructions.map((step) => (
            <div key={step.step_number} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                {step.step_number}
              </div>
              <div className="flex-1 pt-2">
                <p className="text-gray-200">{step.instruction}</p>
                {step.duration_minutes && (
                  <p className="text-sm text-gray-500 mt-1">
                    ⏱️ 약 {step.duration_minutes}분
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition Info */}
      {recipe.nutrition && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📊</span> 영양 정보
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.nutrition.calories && (
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400">
                  {recipe.nutrition.calories}
                </p>
                <p className="text-sm text-gray-400">칼로리 (kcal)</p>
              </div>
            )}
            {recipe.nutrition.protein && (
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">
                  {recipe.nutrition.protein}
                </p>
                <p className="text-sm text-gray-400">단백질</p>
              </div>
            )}
            {recipe.nutrition.carbs && (
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-amber-400">
                  {recipe.nutrition.carbs}
                </p>
                <p className="text-sm text-gray-400">탄수화물</p>
              </div>
            )}
            {recipe.nutrition.fat && (
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">
                  {recipe.nutrition.fat}
                </p>
                <p className="text-sm text-gray-400">지방</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Cooking Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button 
          onClick={() => router.push("/")} 
          className="btn-secondary shadow-2xl"
        >
          🏠 홈으로
        </button>
        <button 
          onClick={() => router.push(`/cook/${recipe.id}`)} 
          className="btn-primary shadow-2xl flex items-center gap-2"
        >
          <span>🍳</span>
          <span>요리 시작하기 (AI 코치)</span>
        </button>
      </div>
    </div>
  );
}
