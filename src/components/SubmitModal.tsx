"use client";

import { useState, useEffect, useCallback } from "react";
import { Question } from "@/lib/types";
import Image from "next/image";

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = "form" | "loading" | "success" | "rejected" | "error";

export default function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const [state, setState] = useState<SubmitState>("form");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Question | null>(null);
  const [error, setError] = useState<string>("");
  const [showFlipped, setShowFlipped] = useState(false);

  const resetAndClose = useCallback(() => {
    setState("form");
    setQuestion("");
    setResult(null);
    setError("");
    setShowFlipped(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetAndClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, resetAndClose]);

  useEffect(() => {
    if (state === "success" && result) {
      // Trigger flip after showing the card
      const timer = setTimeout(() => setShowFlipped(true), 800);
      return () => clearTimeout(timer);
    }
  }, [state, result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setState("loading");
    setError("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: question }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.rejected) {
          setError(data.reason || "Question was not accepted.");
          setState("rejected");
        } else {
          throw new Error(data.error || "Failed to submit");
        }
        return;
      }

      setResult(data.question);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={resetAndClose}
    >
      <div
        className="relative w-[90vw] max-w-lg rounded-3xl bg-zinc-900 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={resetAndClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z" />
          </svg>
        </button>

        {state === "form" && (
          <>
            <h2 className="mb-6 text-2xl font-semibold text-white">
              Submit a Question
            </h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What's a question you'd love to ask someone?"
                className="h-32 w-full resize-none rounded-xl bg-zinc-800 p-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                maxLength={200}
              />
              <div className="mt-2 text-right text-sm text-zinc-500">
                {question.length}/200
              </div>
              <button
                type="submit"
                disabled={!question.trim()}
                className="mt-4 w-full rounded-full bg-white py-3 font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Submit
              </button>
            </form>
          </>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-white" />
            <p className="mt-4 text-zinc-400">Creating your card...</p>
            <p className="mt-2 text-sm text-zinc-500">
              This may take a moment
            </p>
          </div>
        )}

        {state === "success" && result && (
          <div className="flex flex-col items-center">
            <h2 className="mb-6 text-2xl font-semibold text-white">
              Your question is live!
            </h2>
            <div className="perspective-1000 h-64 w-48">
              <div
                className={`relative h-full w-full transition-transform duration-700 transform-style-3d ${
                  showFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front - Image */}
                <div className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl">
                  <Image
                    src={result.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Back - Question */}
                <div className="absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180 rounded-2xl bg-black p-4">
                  <p className="text-center text-sm font-medium text-white">
                    {result.text}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="mt-6 rounded-full bg-white px-6 py-2 font-medium text-black"
            >
              Done
            </button>
          </div>
        )}

        {(state === "rejected" || state === "error") && (
          <div className="flex flex-col items-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 text-red-500"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">
              {state === "rejected" ? "Not Accepted" : "Something went wrong"}
            </h3>
            <p className="mt-2 text-center text-zinc-400">{error}</p>
            <button
              onClick={() => setState("form")}
              className="mt-6 rounded-full bg-white px-6 py-2 font-medium text-black"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
