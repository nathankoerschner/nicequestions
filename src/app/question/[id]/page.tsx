import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";
import DeepLinkView from "@/components/DeepLinkView";

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
    title: "Check out this nice question",
    description: "A beautiful question from Nice Questions",
    openGraph: {
      title: "Check out this nice question",
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
      title: "Check out this nice question",
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

  return <DeepLinkView questionId={id} />;
}
