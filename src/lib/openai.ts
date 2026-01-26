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

export async function generateQuestionImage(
  _question: string,
  category: Category
): Promise<Buffer> {
  const prompt = `Create an abstract, artistic image that evokes the feeling of "${category}" and contemplation.
The image should be:
- Visually striking and modern
- Abstract or semi-abstract
- Rich in color and texture
- NOT contain any text or letters
- Suitable as a card background
- Evocative of deep thought and connection

Style: Contemporary digital art, painterly, dreamy
Mood: Thoughtful, warm, inviting`;

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
