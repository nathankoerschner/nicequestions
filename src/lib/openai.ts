import OpenAI from "openai";
import { Category, GPTValidationResult, CATEGORIES } from "./types";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function validateAndCleanQuestion(
  text: string
): Promise<GPTValidationResult> {
  const prompt = `You are a curator for a question-sharing app called "Nice Questions."
Your job is to evaluate submitted questions and decide if they belong.

ACCEPT most questions. Only reject if the submission:
- Is NOT a question (statements, commands, random text)
- Contains violence, hate speech, or explicit content
- Is obvious spam or gibberish

Yes/no questions are fine. Vague questions are fine. Simple questions are fine.
Be very permissive - when in doubt, accept it.

If accepted, clean it up (fix grammar, punctuation, capitalization) and categorize it.

Categories: ${CATEGORIES.join(", ")}

Respond in JSON format:
{
  "accepted": true/false,
  "cleanedText": "The cleaned question text (only if accepted)",
  "category": "category name (only if accepted)",
  "reason": "Brief reason if rejected"
}

User's submitted question: "${text}"`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result as GPTValidationResult;
}

// Map categories to Unsplash search terms for better results
const CATEGORY_SEARCH_TERMS: Record<Category, string[]> = {
  relationships: ["people together", "friends", "family", "holding hands", "conversation"],
  "self-reflection": ["mirror", "meditation", "solitude", "thinking", "journal"],
  dreams: ["clouds", "stars", "night sky", "surreal", "fantasy landscape"],
  memories: ["vintage", "old photos", "nostalgia", "childhood", "sunset"],
  hypotheticals: ["crossroads", "doors", "paths", "abstract", "possibilities"],
  values: ["nature", "mountains", "ocean", "forest", "peace"],
  creativity: ["art", "paint", "colors", "creative", "inspiration"],
  connection: ["hands", "community", "gathering", "warmth", "together"],
};

export async function generateQuestionImage(
  _question: string,
  category: Category
): Promise<Buffer> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY environment variable is not set");
  }

  // Pick a random search term for this category
  const searchTerms = CATEGORY_SEARCH_TERMS[category];
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=squarish`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const imageUrl = data.urls?.regular;

  if (!imageUrl) {
    throw new Error("No image URL returned from Unsplash");
  }

  // Fetch the image and return as buffer
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
