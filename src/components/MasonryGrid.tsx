"use client";

import { Question } from "@/lib/types";
import QuestionCard from "./QuestionCard";

interface MasonryGridProps {
  questions: Question[];
  onCardClick: (question: Question) => void;
}

// Assign varied sizes based on index for visual interest - more dramatic variation
function getCardSize(index: number): "small" | "medium" | "large" | "xlarge" {
  const pattern = [
    "medium",
    "xlarge",
    "small",
    "large",
    "small",
    "medium",
    "large",
    "small",
    "xlarge",
    "medium",
    "small",
    "large",
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
    <div className="-mx-6 md:-mx-12 lg:-mx-16 columns-2 gap-2 md:columns-3 md:gap-3 lg:columns-4 xl:columns-5 px-0">
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
