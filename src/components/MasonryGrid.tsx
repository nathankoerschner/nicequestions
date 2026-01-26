"use client";

import { Question } from "@/lib/types";
import QuestionCard from "./QuestionCard";

interface MasonryGridProps {
  questions: Question[];
  onCardClick: (question: Question) => void;
}

// Assign varied sizes based on index for visual interest
function getCardSize(index: number): "small" | "medium" | "large" {
  const pattern = [
    "medium",
    "large",
    "small",
    "medium",
    "small",
    "large",
    "medium",
    "small",
  ] as const;
  return pattern[index % pattern.length];
}

export default function MasonryGrid({
  questions,
  onCardClick,
}: MasonryGridProps) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-zinc-500">No questions yet. Be the first to submit one!</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-2 md:columns-3 md:gap-3 lg:columns-4 xl:columns-5">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          onClick={() => onCardClick(question)}
          size={getCardSize(index)}
        />
      ))}
    </div>
  );
}
