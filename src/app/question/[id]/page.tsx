import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";

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
    title: `${question.text} | Nice Questions`,
    description: question.text,
    openGraph: {
      title: question.text,
      description: "A beautiful question from Nice Questions",
      type: "website",
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
  // Redirect to homepage after OG metadata is served
  // The social preview will show the question image
  redirect("/");
}
