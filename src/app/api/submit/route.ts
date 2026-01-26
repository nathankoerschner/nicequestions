import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { validateAndCleanQuestion, generateQuestionImage } from "@/lib/openai";
import { DailyLimits } from "@/lib/types";

const MAX_DAILY_ATTEMPTS = 100;
const MAX_DAILY_ACCEPTED = 100;

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

async function getDailyLimits(): Promise<DailyLimits> {
  const today = getTodayString();
  const doc = await adminDb.collection("config").doc("dailyLimits").get();

  if (!doc.exists) {
    return { date: today, attempts: 0, accepted: 0 };
  }

  const data = doc.data() as DailyLimits;

  // Reset if it's a new day
  if (data.date !== today) {
    return { date: today, attempts: 0, accepted: 0 };
  }

  return data;
}

async function incrementAttempts(): Promise<boolean> {
  const limits = await getDailyLimits();

  if (limits.attempts >= MAX_DAILY_ATTEMPTS) {
    return false;
  }

  await adminDb
    .collection("config")
    .doc("dailyLimits")
    .set({
      date: getTodayString(),
      attempts: limits.attempts + 1,
      accepted: limits.accepted,
    });

  return true;
}

async function incrementAccepted(): Promise<boolean> {
  const limits = await getDailyLimits();

  if (limits.accepted >= MAX_DAILY_ACCEPTED) {
    return false;
  }

  await adminDb
    .collection("config")
    .doc("dailyLimits")
    .set({
      date: getTodayString(),
      attempts: limits.attempts,
      accepted: limits.accepted + 1,
    });

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Question must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (text.length > 200) {
      return NextResponse.json(
        { error: "Question must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Check daily attempt limit
    const canAttempt = await incrementAttempts();
    if (!canAttempt) {
      return NextResponse.json(
        { error: "Daily submission limit reached. Try again tomorrow!" },
        { status: 429 }
      );
    }

    // Validate with GPT
    const validation = await validateAndCleanQuestion(text.trim());

    if (!validation.accepted) {
      return NextResponse.json(
        {
          rejected: true,
          reason: validation.reason || "Question didn't meet our guidelines",
        },
        { status: 400 }
      );
    }

    // Check daily accepted limit
    const canAccept = await incrementAccepted();
    if (!canAccept) {
      return NextResponse.json(
        { error: "Daily acceptance limit reached. Try again tomorrow!" },
        { status: 429 }
      );
    }

    // Get all used Unsplash IDs to prevent duplicates
    const questionsSnapshot = await adminDb.collection("questions").get();
    const usedImageIds = new Set<string>();
    questionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.unsplashId) {
        usedImageIds.add(data.unsplashId);
      }
    });

    // Generate image (will retry if duplicate)
    const imageResult = await generateQuestionImage(
      validation.cleanedText!,
      validation.category!,
      usedImageIds
    );

    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();
    const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const file = bucket.file(filename);

    await file.save(imageResult.buffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    await file.makePublic();

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Create question document
    const questionData = {
      text: validation.cleanedText,
      category: validation.category,
      imageUrl,
      unsplashId: imageResult.unsplashId,
      createdAt: Date.now(),
    };

    const docRef = await adminDb.collection("questions").add(questionData);

    return NextResponse.json({
      success: true,
      question: {
        id: docRef.id,
        ...questionData,
      },
    });
  } catch (error) {
    console.error("Error submitting question:", error);
    return NextResponse.json(
      { error: "Failed to submit question" },
      { status: 500 }
    );
  }
}
