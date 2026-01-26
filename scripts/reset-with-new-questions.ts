import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);
const storage = getStorage(app);

const UNSPLASH_COLLECTION = "ViZ7rtrjAgY"; // Film collection only

const SAMPLE_QUESTIONS = [
  { text: "What's a question you've been afraid to ask?", category: "meet-yourself" },
  { text: "What would you do if you knew you couldn't fail?", category: "for-crossroads" },
  { text: "What's something you wish you could tell your younger self?", category: "meet-yourself" },
  { text: "What makes you feel most alive?", category: "big-questions" },
  { text: "Who has had the biggest impact on your life?", category: "for-loved-ones" },
  { text: "What's a memory that always makes you smile?", category: "meet-yourself" },
  { text: "What would your perfect day look like?", category: "meet-yourself" },
  { text: "What's something you've always wanted to learn?", category: "for-crossroads" },
  { text: "If you could have dinner with anyone, who would it be?", category: "big-questions" },
  { text: "What's the best advice you've ever received?", category: "for-loved-ones" },
  { text: "What are you most grateful for today?", category: "meet-yourself" },
  { text: "What's a risk you're glad you took?", category: "for-crossroads" },
  { text: "What does home mean to you?", category: "for-loved-ones" },
  { text: "What's your favorite way to spend a rainy day?", category: "for-a-gathering" },
  { text: "What's something that never fails to make you laugh?", category: "making-friends" },
  { text: "What do you think is the meaning of life?", category: "big-questions" },
  { text: "What's a small thing that brings you joy?", category: "meet-yourself" },
  { text: "What's your earliest childhood memory?", category: "for-loved-ones" },
  { text: "What's something you believe that most people don't?", category: "big-questions" },
  { text: "What would you want to be remembered for?", category: "big-questions" },
  { text: "What's a dream you've never told anyone about?", category: "meet-yourself" },
  { text: "When do you feel most like yourself?", category: "meet-yourself" },
  { text: "What's the most spontaneous thing you've ever done?", category: "for-a-gathering" },
  { text: "What would you create if you had unlimited resources?", category: "for-crossroads" },
  { text: "Who would you want to reconnect with?", category: "for-loved-ones" },
  { text: "What's a tradition you want to start?", category: "for-a-gathering" },
  { text: "What conversation changed your life?", category: "making-friends" },
  { text: "What do you wish people understood about you?", category: "meet-yourself" },
  { text: "What's your favorite way to show love?", category: "for-loved-ones" },
  { text: "What question would you ask the universe?", category: "big-questions" },
];

async function fetchUnsplashImage(usedIds: Set<string>): Promise<{ buffer: Buffer; unsplashId: string }> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error("UNSPLASH_ACCESS_KEY not set");

  for (let attempt = 0; attempt < 10; attempt++) {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?collections=${UNSPLASH_COLLECTION}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!response.ok) throw new Error(`Unsplash error: ${response.status}`);

    const data = await response.json();
    const unsplashId = data.id;
    const imageUrl = data.urls?.regular;

    if (usedIds.has(unsplashId)) {
      console.log(`  Duplicate ${unsplashId}, retrying...`);
      continue;
    }

    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), unsplashId };
  }

  throw new Error("Could not find unique image after 10 attempts");
}

async function main() {
  // Step 1: Clear all existing questions
  console.log("Clearing existing questions...");
  const snapshot = await db.collection('questions').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Deleted ${snapshot.size} questions.\n`);

  // Step 2: Add new questions with fresh images
  console.log(`Adding ${SAMPLE_QUESTIONS.length} new questions with images from Film collection...\n`);
  
  const bucket = storage.bucket();
  const usedIds = new Set<string>();

  for (let i = 0; i < SAMPLE_QUESTIONS.length; i++) {
    const q = SAMPLE_QUESTIONS[i];
    console.log(`[${i + 1}/${SAMPLE_QUESTIONS.length}] "${q.text.substring(0, 40)}..."`);

    // Fetch image
    const { buffer, unsplashId } = await fetchUnsplashImage(usedIds);
    usedIds.add(unsplashId);

    // Upload to Firebase Storage
    const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    const file = bucket.file(filename);
    await file.save(buffer, { metadata: { contentType: 'image/png' } });
    await file.makePublic();
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Add to Firestore
    await db.collection('questions').add({
      text: q.text,
      category: q.category,
      imageUrl,
      unsplashId,
      createdAt: Date.now() - (SAMPLE_QUESTIONS.length - i) * 60000, // Stagger timestamps
    });

    console.log(`  ✓ Added with image ${unsplashId}`);
  }

  console.log(`\nDone! ${SAMPLE_QUESTIONS.length} new questions added.`);
}

main().catch(console.error);
