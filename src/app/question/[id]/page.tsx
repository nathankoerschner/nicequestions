import { Metadata } from "next";
import Link from "next/link";
import QuestionPageClient from "@/components/QuestionPageClient";

interface QuestionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nicequestions.com";

  return {
    title: "Nice Questions",
    description: "Check out this nice question",
    openGraph: {
      title: "Nice Questions",
      description: "Check out this nice question",
      type: "website",
      url: `${baseUrl}/question/${id}`,
    },
    twitter: {
      card: "summary",
      title: "Nice Questions",
      description: "Check out this nice question",
    },
  };
}

async function getQuestion(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/question/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.question;
  } catch {
    return null;
  }
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params;
  const question = await getQuestion(id);

  if (!question) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
        <h1 className="mb-4 text-2xl font-semibold text-white">
          Question not found
        </h1>
        <p className="mb-8 text-zinc-400">
          This question may have been removed or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-3 font-medium text-black transition-opacity hover:opacity-90"
        >
          Explore Questions
        </Link>
      </div>
    );
  }

  return <QuestionPageClient question={question} />;
}
