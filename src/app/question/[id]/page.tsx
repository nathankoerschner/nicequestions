import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import Image from "next/image";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

interface Question {
  id: string;
  text: string;
  imageUrl: string;
  category: string;
}

async function getQuestion(id: string): Promise<Question | null> {
  const db = getAdminDb();
  const doc = await db.collection("questions").doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Question;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestion(id);

  if (!question) {
    return {
      title: "Question Not Found | Nice Questions",
    };
  }

  return {
    title: question.text,
    description: "A beautiful question from Nice Questions",
    openGraph: {
      title: question.text,
      description: "A beautiful question from Nice Questions",
      type: "website",
      siteName: "Nice Questions",
      images: [
        {
          url: question.imageUrl,
          width: 1200,
          height: 630,
          alt: question.text,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: question.text,
      description: "A beautiful question from Nice Questions",
      images: [question.imageUrl],
    },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { id } = await params;
  const question = await getQuestion(id);

  if (!question) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden shadow-2xl">
        {/* Background image */}
        <Image
          src={question.imageUrl}
          alt=""
          fill
          className="object-cover"
          priority
        />

        {/* Overlay with question */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
          <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed">
            {question.text}
          </p>
          <span className="mt-4 inline-block rounded-full bg-white/20 px-4 py-2 text-sm text-white/80 w-fit">
            {question.category}
          </span>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 text-white/60 hover:text-white transition-colors"
      >
        ← See all questions
      </Link>
    </main>
  );
}
