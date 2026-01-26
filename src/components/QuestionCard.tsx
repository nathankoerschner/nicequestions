"use client";

import { Question } from "@/lib/types";
import Image from "next/image";

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "h-48",
  medium: "h-64",
  large: "h-80",
};

export default function QuestionCard({
  question,
  onClick,
  size = "medium",
}: QuestionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full ${sizeClasses[size]} mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-zinc-900 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50`}
    >
      <Image
        src={question.imageUrl}
        alt=""
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute bottom-3 left-3 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        {question.category}
      </span>
    </button>
  );
}
