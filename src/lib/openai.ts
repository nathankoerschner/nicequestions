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

// Curated Unsplash collections for high-quality aesthetic images
const UNSPLASH_COLLECTIONS = [
  "ViZ7rtrjAgY", // Film - 2300+ curated photos
  "1319040",     // Nature - 6600+ photos
].join(",");

export interface ImageResult {
  buffer: Buffer;
  unsplashId: string;
}

export async function generateQuestionImage(
  _question: string,
  _category: Category,
  usedImageIds: Set<string> = new Set(),
  maxRetries: number = 5
): Promise<ImageResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY environment variable is not set");
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?collections=${UNSPLASH_COLLECTIONS}&orientation=squarish`,
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
    const unsplashId = data.id;

    if (!imageUrl || !unsplashId) {
      throw new Error("No image URL or ID returned from Unsplash");
    }

    // Check if this image has already been used
    if (usedImageIds.has(unsplashId)) {
      console.log(`Duplicate image ${unsplashId} found, retrying (attempt ${attempt + 1}/${maxRetries})`);
      continue;
    }

    // Fetch the image and return as buffer with ID
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      unsplashId,
    };
  }

  throw new Error(`Could not find unique image after ${maxRetries} attempts`);
}
