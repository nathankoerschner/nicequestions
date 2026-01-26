import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Question, Category } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as Category | null;

    let query = adminDb
      .collection("questions")
      .orderBy("createdAt", "desc")
      .limit(100);

    if (category) {
      query = adminDb
        .collection("questions")
        .where("category", "==", category)
        .orderBy("createdAt", "desc")
        .limit(100);
    }

    const snapshot = await query.get();
    const questions: Question[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
