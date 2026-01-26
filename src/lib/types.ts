export interface Question {
  id: string;
  text: string;
  category: Category;
  imageUrl: string;
  createdAt: number;
}

export type Category =
  | "for-crossroads"
  | "for-loved-ones"
  | "making-friends"
  | "big-questions"
  | "for-a-gathering"
  | "meet-yourself";

export const CATEGORIES: Category[] = [
  "for-crossroads",
  "for-loved-ones",
  "making-friends",
  "big-questions",
  "for-a-gathering",
  "meet-yourself",
];

export interface DailyLimits {
  date: string;
  attempts: number;
  accepted: number;
}

export interface SubmissionResult {
  success: boolean;
  question?: Question;
  error?: string;
  rejected?: boolean;
  reason?: string;
}

export interface GPTValidationResult {
  accepted: boolean;
  cleanedText?: string;
  category?: Category;
  reason?: string;
}

export interface LimitStatus {
  limitReached: boolean;
  attempts: number;
  maxAttempts: number;
  accepted: number;
  maxAccepted: number;
}
