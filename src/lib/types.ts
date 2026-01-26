export interface Question {
  id: string;
  text: string;
  category: Category;
  imageUrl: string;
  createdAt: number;
}

export type Category =
  | "relationships"
  | "self-reflection"
  | "dreams"
  | "memories"
  | "hypotheticals"
  | "values"
  | "creativity"
  | "connection";

export const CATEGORIES: Category[] = [
  "relationships",
  "self-reflection",
  "dreams",
  "memories",
  "hypotheticals",
  "values",
  "creativity",
  "connection",
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
