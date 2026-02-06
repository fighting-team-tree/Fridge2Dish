"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GenerateRecipesResponse, Recipe } from "@/lib/types";

export default function RecipesPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerateRecipesResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("recipesResult");
    if (stored) {
      setResult(JSON.parse(stored) as GenerateRecipesResponse);
    } else {
      router.push("/");
    }
  }, [router]);

  const handleSelectRecipe = (recipe: Recipe) => {
    sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe));
    router.push(`/recipe/${recipe.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "중간":
        return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "어려움":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/analyze")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold">추천 레시피</h1>
          <p className="text-gray-400">
            {result.recipes.length}개의 레시피를 찾았어요
          </p>
        </div>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.recipes.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => handleSelectRecipe(recipe)}
            className="recipe-card text-left group"
          >
            {/* Placeholder Image */}
            <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-6xl group-hover:scale-110 transition-transform">
                🍽️
              </span>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-400 transition">
                {recipe.title_ko || recipe.title}
              </h3>
              
              {recipe.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {recipe.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`tag ${getDifficultyColor(recipe.difficulty)}`}
                >
                  {recipe.difficulty}
                </span>
                <span className="tag tag-secondary">
                  ⏱️ {recipe.cooking_time_minutes}분
                </span>
                <span className="tag tag-secondary">
                  👥 {recipe.servings}인분
                </span>
              </div>

              {/* Ingredients Preview */}
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-400">필요 재료: </span>
                {recipe.ingredients.slice(0, 3).join(", ")}
                {recipe.ingredients.length > 3 && (
                  <span> 외 {recipe.ingredients.length - 3}개</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {result.recipes.length === 0 && (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">😢</span>
          <h2 className="text-2xl font-bold mb-2">
            레시피를 찾지 못했어요
          </h2>
          <p className="text-gray-400 mb-6">
            다른 재료 조합으로 다시 시도해보세요
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            처음으로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
