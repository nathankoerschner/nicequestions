"use client";

import { useState, useEffect } from "react";
import { Question } from "@/lib/types";
import MasonryGrid from "@/components/MasonryGrid";
import CardModal from "@/components/CardModal";
import Link from "next/link";

interface DeepLinkViewProps {
  questionId: string;
}

export default function DeepLinkView({ questionId }: DeepLinkViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

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

  const handleClose = () => {
    setSelectedQuestion(null);
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link href="/" className="block">
            <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
              nicequestions.com
            </h1>
          </Link>
        </div>
      </header>

      {/* Main content - edge to edge */}
      <div className="pb-8">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-black" />
          </div>
        ) : (
          <MasonryGrid
            questions={questions}
            onCardClick={setSelectedQuestion}
          />
        )}
      </div>

      {/* Card Modal */}
      <CardModal question={selectedQuestion} onClose={handleClose} />
    </main>
  );
}
