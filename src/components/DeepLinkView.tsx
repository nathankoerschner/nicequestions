"use client";

import { useState, useEffect } from "react";
import { Question, Category, LimitStatus } from "@/lib/types";
import MasonryGrid from "@/components/MasonryGrid";
import CardModal from "@/components/CardModal";
import CategoryFilter from "@/components/CategoryFilter";
import SubmitButton from "@/components/SubmitButton";
import SubmitModal from "@/components/SubmitModal";
import Link from "next/link";

interface DeepLinkViewProps {
  questionId: string;
}

export default function DeepLinkView({ questionId }: DeepLinkViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null);

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
    fetchLimits();
  }, []);

  // Fisher-Yates shuffle for random order
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/questions");
        const data = await response.json();
        const fetchedQuestions: Question[] = data.questions || [];
        const shuffledQuestions = shuffleArray(fetchedQuestions);
        setQuestions(shuffledQuestions);
        setFilteredQuestions(shuffledQuestions);

        // Find and auto-open the shared question
        const sharedQuestion = shuffledQuestions.find(
          (q) => q.id === questionId
        );
        if (sharedQuestion && !hasAutoOpened) {
          // Small delay to let the grid render first
          setTimeout(() => {
            setSelectedQuestion(sharedQuestion);
            setHasAutoOpened(true);
          }, 100);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [questionId, hasAutoOpened]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredQuestions(
        questions.filter((q) => q.category === selectedCategory)
      );
    } else {
      setFilteredQuestions(questions);
    }
  }, [selectedCategory, questions]);

  const handleClose = () => {
    setSelectedQuestion(null);
  };

  const handleSubmitClose = () => {
    setIsSubmitOpen(false);
    fetchLimits();
  };

  const handleSubmitSuccess = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
    setFilteredQuestions((prev) => [newQuestion, ...prev]);
    setSelectedQuestion(newQuestion);
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-2">
          <Link href="/" className="block">
            <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
              nicequestions.com
            </h1>
          </Link>
        </div>
      </header>

      {/* Filter Bar - at top, not sticky */}
      <div className="bg-white">
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
        <SubmitButton onClick={() => setIsSubmitOpen(true)} />
      )}

      {/* Modals */}
      <CardModal question={selectedQuestion} onClose={handleClose} />
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={handleSubmitClose}
        onSuccess={handleSubmitSuccess}
        limitReached={limitStatus?.limitReached}
      />
    </main>
  );
}
