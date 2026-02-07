"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { analyzeFridge } from "@/lib/api";
import { Ingredient } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 미리보기 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
    setIsLoading(true);

    try {
      const result = await analyzeFridge(file);
      
      // 결과를 sessionStorage에 저장하고 분석 페이지로 이동
      sessionStorage.setItem("analyzeResult", JSON.stringify(result));
      router.push("/analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  }, [router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // 샘플 데이터로 체험하기
  const handleSampleDemo = useCallback(() => {
    const sampleIngredients: Ingredient[] = [
      { name: "chicken breast", name_ko: "닭가슴살", quantity: "400g", condition: "fresh" },
      { name: "onion", name_ko: "양파", quantity: "1개", condition: "fresh" },
      { name: "garlic", name_ko: "마늘", quantity: "5쪽", condition: "fresh" },
      { name: "soy sauce", name_ko: "간장", quantity: "적당량", condition: "sealed" },
      { name: "rice", name_ko: "밥", quantity: "2공기", condition: "fresh" },
      { name: "egg", name_ko: "계란", quantity: "3개", condition: "fresh" },
    ];

    const sampleResult = {
      ingredients: sampleIngredients,
      allergens: ["egg"],
      analysis_confidence: 0.95,
      investigation_needed: [
        "검은색 비닐봉지 안에 무엇이 들어있는지 확인이 필요합니다.",
        "우유의 유통기한이 잘 보이지 않아요. 날짜 부분을 더 가깝게 찍어주시겠어요?",
      ],
      agent_message: "냉장고 우측 하단에 있는 갈색 병은 질감과 라벨 디자인으로 보아 '굴소스'일 확률이 92%입니다. 이를 활용한 중식 볶음 요리를 추천해 드릴까요?",
    };

    sessionStorage.setItem("analyzeResult", JSON.stringify(sampleResult));
    router.push("/analyze");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <span className="text-2xl">🥗</span>
          <span className="text-emerald-400 text-sm font-medium">Powered by Gemini 3</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
          RecipeVision
        </h1>
        
        <p className="text-xl text-gray-400 max-w-xl mx-auto">
          냉장고 사진 한 장으로<br />
          <span className="text-white font-medium">AI가 추천하는 맞춤 레시피</span>를 받아보세요
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone glass-card w-full max-w-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
          isDragOver ? "drag-over" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="absolute inset-0">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-4 p-8">
          {isLoading ? (
            <>
              <div className="spinner w-16 h-16" />
              <p className="text-lg font-medium">AI가 식재료를 분석하고 있어요...</p>
              <p className="text-sm text-gray-400">잠시만 기다려주세요</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                <span className="text-4xl">📷</span>
              </div>
              <p className="text-lg font-medium">냉장고 또는 식재료 사진을 올려주세요</p>
              <p className="text-sm text-gray-400">드래그 & 드롭 또는 클릭하여 업로드</p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Sample Demo Button */}
      <button
        onClick={handleSampleDemo}
        className="btn-secondary mt-8"
        disabled={isLoading}
      >
        🍳 샘플 데이터로 체험하기
      </button>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
        {[
          { icon: "🔍", title: "스마트 인식", desc: "AI가 식재료를 자동으로 인식" },
          { icon: "📖", title: "맞춤 레시피", desc: "보유 재료 기반 레시피 추천" },
          { icon: "🖼️", title: "완성 미리보기", desc: "AI가 생성한 완성 이미지" },
        ].map((feature, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
