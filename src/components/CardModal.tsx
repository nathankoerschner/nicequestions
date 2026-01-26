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
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (question) {
      // Stage 0: Background fades in
      setIsVisible(true);
      // Stage 1: Card zooms in after background starts fading
      const zoomTimer = setTimeout(() => setIsZoomed(true), 200);
      // Stage 2: Pause on image, then dramatic flip
      const flipTimer = setTimeout(() => setIsFlipped(true), 1280);
      return () => {
        clearTimeout(zoomTimer);
        clearTimeout(flipTimer);
      };
    } else {
      setIsFlipped(false);
      setIsZoomed(false);
      setIsVisible(false);
    }
  }, [question]);

  const handleClose = useCallback(() => {
    // Stage 1: Flip back
    setIsFlipped(false);
    // Stage 2: Zoom out after flip
    setTimeout(() => {
      setIsZoomed(false);
    }, 400);
    // Stage 3: Fade background after card is gone
    setTimeout(() => {
      setIsVisible(false);
    }, 1100);
    // Stage 4: Clean up after background fades
    setTimeout(() => {
      onClose();
    }, 1800);
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-700 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`perspective-1000 relative h-[70vh] w-[85vw] max-w-md cursor-default transition-all duration-500 ease-out ${
          isZoomed
            ? "scale-100 opacity-100 shadow-2xl shadow-black/50"
            : "scale-75 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative h-full w-full transform-style-3d transition-transform ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isFlipped ? "rotate-y-180 duration-700" : "duration-500"
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

      </div>
    </div>
  );
}
