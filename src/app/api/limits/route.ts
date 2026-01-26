import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DailyLimits } from "@/lib/types";

const MAX_DAILY_ATTEMPTS = 100;
const MAX_DAILY_ACCEPTED = 50;

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

export async function GET() {
  try {
    const limits = await getDailyLimits();

    const limitReached =
      limits.attempts >= MAX_DAILY_ATTEMPTS ||
      limits.accepted >= MAX_DAILY_ACCEPTED;

    return NextResponse.json({
      limitReached,
      attempts: limits.attempts,
      maxAttempts: MAX_DAILY_ATTEMPTS,
      accepted: limits.accepted,
      maxAccepted: MAX_DAILY_ACCEPTED,
    });
  } catch (error) {
    console.error("Error fetching limits:", error);
    return NextResponse.json(
      { error: "Failed to fetch limits" },
      { status: 500 }
    );
  }
}
