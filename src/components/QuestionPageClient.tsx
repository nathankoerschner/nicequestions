"use client";

import { useState, useEffect } from "react";
import { Question } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

interface QuestionPageClientProps {
  question: Question;
}

export default function QuestionPageClient({ question }: QuestionPageClientProps) {
  const [animationStage, setAnimationStage] = useState<
    "initial" | "zoom" | "flip" | "reveal"
  >("initial");

  useEffect(() => {
    // Animation sequence
    const timers = [
      setTimeout(() => setAnimationStage("zoom"), 100),
      setTimeout(() => setAnimationStage("flip"), 1200),
      setTimeout(() => setAnimationStage("reveal"), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Card container */}
      <div className="perspective-1000 relative">
        <div
          className={`relative transition-all duration-700 transform-style-3d ${
            animationStage === "initial"
              ? "h-32 w-24 opacity-0 scale-50"
              : animationStage === "zoom"
              ? "h-[60vh] w-[75vw] max-w-md opacity-100 scale-100"
              : animationStage === "flip" || animationStage === "reveal"
              ? "h-[60vh] w-[75vw] max-w-md opacity-100 scale-100 rotate-y-180"
              : ""
          }`}
        >
          {/* Front - Image */}
          <div className="absolute inset-0 backface-hidden overflow-hidden rounded-3xl">
            <Image
              src={question.imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Back - Question */}
          <div className="absolute inset-0 flex flex-col items-center justify-center backface-hidden rotate-y-180 rounded-3xl bg-black p-8">
            <p className="text-center text-2xl font-medium leading-relaxed text-white md:text-3xl">
              {question.text}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
                {question.category}
              </span>
              <ShareButton question={question} />
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className={`mt-12 flex flex-col items-center gap-4 transition-opacity duration-500 ${
          animationStage === "reveal" ? "opacity-100" : "opacity-0"
        }`}
      >
        <Link
          href="/"
          className="rounded-full bg-white px-8 py-3 font-medium text-black transition-opacity hover:opacity-90"
        >
          Explore More Questions
        </Link>
        <button
          onClick={() => {
            window.location.href = "/?submit=true";
          }}
          className="text-zinc-400 transition-colors hover:text-white"
        >
          Submit Your Own
        </button>
      </div>
    </div>
  );
}
