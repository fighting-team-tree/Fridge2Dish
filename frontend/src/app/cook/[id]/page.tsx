"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCookingFeedback } from "@/lib/api";
import { Recipe, CookingFeedbackResponse } from "@/lib/types";

export default function CookingPage() {
  const router = useRouter();
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCoaching, setIsCoaching] = useState(false);
  const [feedback, setFeedback] = useState<CookingFeedbackResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedRecipe");
    if (stored) {
      setRecipe(JSON.parse(stored) as Recipe);
    } else {
      router.push("/recipes");
    }
  }, [router]);

  const currentStep = recipe?.instructions[currentStepIdx];

  const handleCaptureFeedback = useCallback(async (file: File) => {
    if (!currentStep) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await getCookingFeedback(file, currentStep.instruction);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "피드백을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentStep]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCaptureFeedback(file);
  };

  const nextStep = () => {
    if (recipe && currentStepIdx < recipe.instructions.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setFeedback(null);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setFeedback(null);
    }
  };

  if (!recipe || !currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-20">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{recipe.title_ko || recipe.title}</h1>
          <p className="text-xs text-gray-500">조리 단계 {currentStepIdx + 1} / {recipe.instructions.length}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-32">
        {/* Step Content */}
        <div className="mt-8 mb-12">
          <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-4">
            STEP {currentStep.step_number}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            {currentStep.instruction}
          </h2>
          {currentStep.duration_minutes && (
            <div className="flex items-center gap-2 text-gray-400">
              <span>⏱️ 예상 소요 시간:</span>
              <span className="text-white font-medium">{currentStep.duration_minutes}분</span>
            </div>
          )}
        </div>

        {/* AI Coaching Section */}
        <div className={`glass-card p-6 border-t-4 transition-all duration-500 ${
          feedback?.status === "위험" ? "border-red-500" : 
          feedback?.status === "주의" ? "border-amber-500" : "border-emerald-500"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🤖</span> AI 수셰프 코칭
            </h3>
            <button 
              onClick={() => setIsCoaching(!isCoaching)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isCoaching ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-400"
              }`}
            >
              {isCoaching ? "ON" : "OFF"}
            </button>
          </div>

          {!isCoaching ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4 text-sm">AI 코칭을 켜고 현재 조리 사진을 찍으면<br/>실시간 피드백을 받을 수 있습니다.</p>
              <button 
                onClick={() => setIsCoaching(true)}
                className="text-emerald-400 text-sm font-bold border-b border-emerald-400/30 pb-1"
              >
                코칭 모드 활성화하기
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Feedback Display */}
              {feedback ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      feedback.status === "정상" ? "bg-emerald-500 text-black" :
                      feedback.status === "주의" ? "bg-amber-500 text-black" :
                      "bg-red-500 text-white"
                    }`}>
                      {feedback.status}
                    </span>
                    <p className="font-bold text-lg">{feedback.feedback}</p>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">AI 관찰 내용</p>
                      <p className="text-sm text-gray-300">{feedback.observation}</p>
                    </div>
                    {feedback.thought && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-[10px] font-bold text-emerald-400/50 mb-1 uppercase tracking-widest">Thought Signature</p>
                        <p className="text-xs text-gray-400 leading-relaxed italic">"{feedback.thought}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center py-10">
                  <div className="spinner w-10 h-10 mb-4" />
                  <p className="text-sm text-gray-400">조리 상태를 분석하고 있습니다...</p>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-2xl group hover:border-emerald-500/50 transition-colors cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">📸</span>
                  <p className="text-sm text-gray-400">현재 조리 사진을 찍거나 올려주세요</p>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={onFileChange}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full btn-secondary py-4 text-emerald-400 border-emerald-500/20"
                disabled={isAnalyzing}
              >
                {feedback ? "다시 확인하기" : "조리 상태 스캔하기"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Navigation Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-10">
        <div className="max-w-4xl mx-auto flex gap-4">
          <button 
            onClick={prevStep}
            disabled={currentStepIdx === 0}
            className="flex-1 py-4 bg-white/5 rounded-2xl font-bold disabled:opacity-20 transition"
          >
            이전
          </button>
          
          {currentStepIdx < recipe.instructions.length - 1 ? (
            <button 
              onClick={nextStep}
              className="flex-[2] py-4 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition"
            >
              다음 단계로
            </button>
          ) : (
            <button 
              onClick={() => router.push("/")}
              className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-2xl font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              요리 완료! 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
