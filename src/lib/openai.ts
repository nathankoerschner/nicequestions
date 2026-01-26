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
  const prompt = `You are a curator for a thoughtful question-sharing app called "Nice Questions."
Your job is to evaluate submitted questions and decide if they belong.

Good questions are:
- Open-ended and thought-provoking
- Encourage meaningful conversations
- Safe for all ages
- Not yes/no questions
- Not offensive, political, or controversial
- Not spam or nonsense

If the question is good, clean it up (fix grammar, punctuation, capitalization) and categorize it.

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

export async function generateQuestionImage(
  _question: string,
  category: Category
): Promise<Buffer> {
  const prompt = `Create a photorealistic image related to the theme of "${category}".
The image should be:
- A beautiful photograph of nature or daily life
- Photorealistic, like a professional photograph
- Natural lighting and composition
- NOT contain any text or letters
- Suitable as a card background
- Evocative and emotionally resonant

Style: Professional photography, natural, authentic
Subject: Nature scenes (landscapes, plants, animals, weather) or everyday life moments (hands, objects, activities, spaces)`;

  const response = await getOpenAI().images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL returned from DALL-E");
  }

  // Fetch the image and return as buffer
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
