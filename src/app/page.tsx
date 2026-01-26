"use client";

import { useState, useEffect } from "react";
import { Question, Category } from "@/lib/types";
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

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredQuestions(
        questions.filter((q) => q.category === selectedCategory)
      );
    } else {
      setFilteredQuestions(questions);
    }
  }, [selectedCategory, questions]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions");
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitClose = () => {
    setIsSubmitOpen(false);
    // Refresh questions after submission
    fetchQuestions();
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Nice Questions
          </h1>
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 pb-24">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        ) : (
          <MasonryGrid
            questions={filteredQuestions}
            onCardClick={setSelectedQuestion}
          />
        )}
      </div>

      {/* Submit FAB */}
      <SubmitButton onClick={() => setIsSubmitOpen(true)} />

      {/* Modals */}
      <CardModal
        question={selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
      />
      <SubmitModal isOpen={isSubmitOpen} onClose={handleSubmitClose} />
    </main>
  );
}
