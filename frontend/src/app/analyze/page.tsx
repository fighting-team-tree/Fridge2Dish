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

      {/* Agent Message (Thought Signature) */}
      {result.agent_message && (
        <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <span className="text-4xl text-emerald-400">🤖</span>
          </div>
          <h2 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
            <span>AI 에이전트의 분석 노트</span>
          </h2>
          <p className="text-gray-200 leading-relaxed italic">
            "{result.agent_message}"
          </p>
        </div>
      )}

      {/* Investigation Needed (Active Investigation) */}
      {result.investigation_needed && result.investigation_needed.length > 0 && (
        <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
          <h2 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
            <span>🔍 능동적 탐색: 추가 정보가 필요해요</span>
          </h2>
          <ul className="space-y-3">
            {result.investigation_needed.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-gray-300 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl text-blue-300 font-medium transition flex items-center justify-center gap-2"
          >
            <span>📸 추가 사진 찍으러 가기</span>
          </button>
        </div>
      )}

      {/* Allergens Warning */}
      {result.allergens.length > 0 && (
        <div className="mb-8 px-6 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="font-bold text-amber-400">알레르기 주의</p>
            <p className="text-sm text-gray-400">
              분석된 알레르겐: {result.allergens.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Ingredients Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          인식된 식재료 ({result.ingredients.length}개)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {result.ingredients.map((ingredient) => {
            const isSelected = selectedIngredients.has(ingredient.name);
            return (
              <button
                key={ingredient.name}
                onClick={() => toggleIngredient(ingredient.name)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "bg-white/5 border-white/10 opacity-50 hover:opacity-100"
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
                    <span className="ml-2 tag text-[10px] uppercase tracking-tighter">{ingredient.condition}</span>
                  )}
                </div>
                
                {/* Expiry Badge */}
                {ingredient.estimated_shelf_life_days !== undefined && (
                  <div className={`mt-3 px-2 py-1 rounded-md text-[10px] font-bold inline-block ${
                    ingredient.estimated_shelf_life_days <= 3 
                      ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                      : "bg-white/5 text-gray-400"
                  }`}>
                    D-{ingredient.estimated_shelf_life_days}
                  </div>
                )}
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
