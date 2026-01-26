"use client";

import { Question } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import ShareButton from "./ShareButton";

interface CardModalProps {
  question: Question | null;
  onClose: () => void;
}

export default function CardModal({ question, onClose }: CardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (question) {
      setIsVisible(true);
      // Start the flip animation after a brief pause
      const timer = setTimeout(() => setIsFlipped(true), 600);
      return () => clearTimeout(timer);
    } else {
      setIsFlipped(false);
      setIsVisible(false);
    }
  }, [question]);

  const handleClose = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  if (!question) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className="perspective-1000 relative h-[70vh] w-[85vw] max-w-md cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative h-full w-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front of card - Image */}
          <div className="absolute inset-0 backface-hidden overflow-hidden">
            <Image
              src={question.imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Back of card - Question */}
          <div className="absolute inset-0 flex flex-col items-center justify-center backface-hidden rotate-y-180 bg-black p-8">
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

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
