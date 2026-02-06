"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateRecipes } from "@/lib/api";
import { AnalyzeFridgeResponse, Ingredient } from "@/lib/types";

export default function AnalyzePage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalyzeFridgeResponse | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analyzeResult");
    if (stored) {
      const parsed = JSON.parse(stored) as AnalyzeFridgeResponse;
      setResult(parsed);
      // 모든 재료를 기본 선택
      setSelectedIngredients(new Set(parsed.ingredients.map((i) => i.name)));
    } else {
      router.push("/");
    }
  }, [router]);

  const toggleIngredient = useCallback((name: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleGenerateRecipes = useCallback(async () => {
    if (!result || selectedIngredients.size === 0) return;

    setIsLoading(true);
    setError(null);

    const selectedList = result.ingredients.filter((i) =>
      selectedIngredients.has(i.name)
    );

    try {
      const response = await generateRecipes({ ingredients: selectedList });
      sessionStorage.setItem("recipesResult", JSON.stringify(response));
      sessionStorage.setItem("selectedIngredients", JSON.stringify(selectedList));
      router.push("/recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "레시피 생성 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  }, [result, selectedIngredients, router]);

  if (!result) {
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
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold">식재료 분석 결과</h1>
          <p className="text-gray-400">
            신뢰도: {Math.round(result.analysis_confidence * 100)}%
          </p>
        </div>
      </div>

      {/* Allergens Warning */}
      {result.allergens.length > 0 && (
        <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-400">알레르기 주의</p>
            <p className="text-sm text-gray-400">
              감지된 알레르겐: {result.allergens.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Ingredients Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          인식된 식재료 ({result.ingredients.length}개)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {result.ingredients.map((ingredient) => {
            const isSelected = selectedIngredients.has(ingredient.name);
            return (
              <button
                key={ingredient.name}
                onClick={() => toggleIngredient(ingredient.name)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500/50"
                    : "bg-white/5 border-white/10 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-medium">
                    {ingredient.name_ko || ingredient.name}
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-500"
                    }`}
                  >
                    {isSelected && "✓"}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {ingredient.quantity && <span>{ingredient.quantity}</span>}
                  {ingredient.condition && (
                    <span className="ml-2 tag text-xs">{ingredient.condition}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-medium">
            {selectedIngredients.size}개 재료 선택됨
          </p>
          <p className="text-sm text-gray-400">
            선택한 재료로 레시피를 추천받으세요
          </p>
        </div>
        <button
          onClick={handleGenerateRecipes}
          disabled={isLoading || selectedIngredients.size === 0}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="spinner w-5 h-5" />
              <span>레시피 생성 중...</span>
            </>
          ) : (
            <>
              <span>🍳</span>
              <span>레시피 추천 받기</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
