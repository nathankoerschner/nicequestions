"use client";

import { useState, useEffect } from "react";
import { Question, Category, LimitStatus } from "@/lib/types";
import MasonryGrid from "@/components/MasonryGrid";
import CardModal from "@/components/CardModal";
import CategoryFilter from "@/components/CategoryFilter";
import SubmitButton from "@/components/SubmitButton";
import SubmitModal from "@/components/SubmitModal";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await fetch("/api/limits");
      const data = await response.json();
      setLimitStatus(data);
    } catch (error) {
      console.error("Failed to fetch limits:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setFilteredQuestions(
        questions.filter((q) => q.category === selectedCategory)
      );
    } else {
      setFilteredQuestions(questions);
    }
  }, [selectedCategory, questions]);

  // Fisher-Yates shuffle for random order on each load
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      const data = await response.json();
      setQuestions(shuffleArray(data.questions || []));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClose = () => {
    setIsSubmitOpen(false);
    // Refresh limits after submission
    fetchLimits();
  };

  const handleSubmitSuccess = (newQuestion: Question) => {
    // Add the new question to the beginning of the list
    setQuestions((prev) => [newQuestion, ...prev]);
    setFilteredQuestions((prev) => [newQuestion, ...prev]);
    // Show the CardModal with the new question
    setSelectedQuestion(newQuestion);
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            nicequestions.com
          </h1>
        </div>
      </header>

      {/* Filter Bar - at top, not sticky */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Main content - edge to edge */}
      <div className="pb-24">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
          </div>
        ) : (
          <MasonryGrid
            questions={filteredQuestions}
            onCardClick={setSelectedQuestion}
          />
        )}
      </div>

      {/* Submit FAB - hidden when daily limit reached */}
      {!limitStatus?.limitReached && (
        <SubmitButton
          onClick={() => setIsSubmitOpen(true)}
        />
      )}

      {/* Modals */}
      <CardModal
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
      />
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={handleSubmitClose}
        onSuccess={handleSubmitSuccess}
        limitReached={limitStatus?.limitReached}
      />
    </main>
  );
}
