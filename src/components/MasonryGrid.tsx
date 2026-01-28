"use client";

import { Question } from "@/lib/types";
import QuestionCard from "./QuestionCard";

interface MasonryGridProps {
  questions: Question[];
  onCardClick: (question: Question) => void;
}

// Generate varied sizes that avoid adjacent duplicates across columns
const sizes = ["small", "medium", "large", "xlarge"] as const;

// Pattern designed to minimize same-size adjacency across different column counts (2-5)
// Each row in the pattern should have different sizes
const masterPattern = [
  "medium", "small", "xlarge", "large", "medium",    // row 1
  "small", "large", "medium", "xlarge", "small",     // row 2
  "xlarge", "medium", "small", "medium", "large",    // row 3
  "large", "xlarge", "large", "small", "xlarge",     // row 4
  "small", "large", "medium", "large", "medium",     // row 5
  "medium", "small", "xlarge", "medium", "small",    // row 6
  "xlarge", "large", "small", "xlarge", "large",     // row 7
  "large", "medium", "large", "small", "xlarge",     // row 8
] as const;

function getCardSize(index: number): "small" | "medium" | "large" | "xlarge" {
  return masterPattern[index % masterPattern.length] as "small" | "medium" | "large" | "xlarge";
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
