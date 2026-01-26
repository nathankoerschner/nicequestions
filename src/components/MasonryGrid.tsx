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

// Determine which cards bleed off edges
function getBleedStyle(index: number): string {
  // Every 5th card bleeds left, every 7th bleeds right
  if (index % 5 === 0) return "-ml-4 md:-ml-8";
  if (index % 7 === 2) return "-mr-4 md:-mr-8";
  return "";
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
    <div className="columns-2 gap-3 md:columns-3 lg:columns-4 xl:columns-5 md:gap-4">
      {questions.map((question, index) => (
        <div key={question.id} className={getBleedStyle(index)}>
          <QuestionCard
            question={question}
            onClick={() => onCardClick(question)}
            size={getCardSize(index)}
          />
        </div>
      ))}
    </div>
  );
}
