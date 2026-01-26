import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
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

const UNSPLASH_COLLECTION = "ViZ7rtrjAgY"; // Film collection
const BATCH_SIZE = 40; // Stay under 50/hour Unsplash limit
const BATCH_DELAY_MS = 65 * 60 * 1000; // 65 minutes between batches (to reset rate limit)

interface Question {
  text: string;
  category: string;
}

function parseQuestionsFile(filepath: string): Question[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');

  const questions: Question[] = [];
  let currentCategory = 'uncategorized';

  const categoryMap: Record<string, string> = {
    'for crossroads': 'for-crossroads',
    'big questions': 'big-questions',
    'for loved ones': 'for-loved-ones',
    'making friends': 'making-friends',
    'for a gathering': 'for-a-gathering',
    'meet yourself': 'meet-yourself',
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for category header
    if (trimmed.startsWith('#')) {
      const categoryName = trimmed.slice(1).trim().toLowerCase();
      currentCategory = categoryMap[categoryName] || categoryName.replace(/\s+/g, '-');
      continue;
    }

    // Skip empty lines
    if (!trimmed) continue;

    // Add question with current category
    questions.push({
      text: trimmed,
      category: currentCategory,
    });
  }

  return questions;
}

async function getExistingUnsplashIds(): Promise<Set<string>> {
  const snapshot = await db.collection('questions').get();
  const ids = new Set<string>();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.unsplashId) {
      ids.add(data.unsplashId);
    }
  });
  return ids;
}

async function fetchUnsplashImage(usedIds: Set<string>): Promise<{ buffer: Buffer; unsplashId: string }> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error("UNSPLASH_ACCESS_KEY not set");

  for (let attempt = 0; attempt < 10; attempt++) {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?collections=${UNSPLASH_COLLECTION}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Unsplash error: ${response.status} - ${text}`);
    }

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const filepath = process.argv[2] || 'seed-questions';

  console.log(`Parsing questions from: ${filepath}`);
  const questions = parseQuestionsFile(filepath);

  // Dedupe questions by text
  const seen = new Set<string>();
  const uniqueQuestions = questions.filter(q => {
    const key = q.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Found ${questions.length} questions (${uniqueQuestions.length} unique)`);

  // Show category breakdown
  const byCategory: Record<string, number> = {};
  for (const q of uniqueQuestions) {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  }
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }

  // Get existing unsplash IDs to avoid duplicates
  console.log('\nFetching existing unsplash IDs...');
  const usedIds = await getExistingUnsplashIds();
  console.log(`Found ${usedIds.size} existing images`);

  const bucket = storage.bucket();
  const totalBatches = Math.ceil(uniqueQuestions.length / BATCH_SIZE);

  console.log(`\nWill process ${uniqueQuestions.length} questions in ${totalBatches} batches of ${BATCH_SIZE}`);

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    const start = batchNum * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, uniqueQuestions.length);
    const batch = uniqueQuestions.slice(start, end);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`BATCH ${batchNum + 1}/${totalBatches} (questions ${start + 1}-${end})`);
    console.log(`${'='.repeat(60)}`);

    for (let i = 0; i < batch.length; i++) {
      const q = batch[i];
      const globalIndex = start + i + 1;
      console.log(`\n[${globalIndex}/${uniqueQuestions.length}] "${q.text.substring(0, 50)}..."`);
      console.log(`  Category: ${q.category}`);

      try {
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
          createdAt: Date.now() - (uniqueQuestions.length - globalIndex) * 60000,
        });

        console.log(`  ✓ Added with image ${unsplashId}`);
      } catch (error) {
        console.error(`  ✗ Failed: ${error}`);
      }
    }

    // Wait between batches (except for the last one)
    if (batchNum < totalBatches - 1) {
      console.log(`\n⏳ Waiting ${BATCH_DELAY_MS / 1000}s before next batch (rate limit)...`);
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Done! Processed ${uniqueQuestions.length} questions.`);
}

main().catch(console.error);
