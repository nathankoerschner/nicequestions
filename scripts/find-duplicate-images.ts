import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

async function findDuplicates() {
  const snapshot = await db.collection('questions').get();
  
  const imageMap = new Map<string, { id: string; text: string; createdAt: number }[]>();
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    const imageUrl = data.imageUrl;
    
    if (!imageMap.has(imageUrl)) {
      imageMap.set(imageUrl, []);
    }
    imageMap.get(imageUrl)!.push({
      id: doc.id,
      text: data.text,
      createdAt: data.createdAt,
    });
  });
  
  console.log(`Total questions: ${snapshot.size}`);
  
  // Find duplicates
  const duplicates: { imageUrl: string; questions: { id: string; text: string; createdAt: number }[] }[] = [];
  
  imageMap.forEach((questions, imageUrl) => {
    if (questions.length > 1) {
      duplicates.push({ imageUrl, questions });
    }
  });
  
  if (duplicates.length === 0) {
    console.log('No duplicate images found!');
    return;
  }
  
  console.log(`\nFound ${duplicates.length} duplicate image(s):\n`);
  
  duplicates.forEach(({ imageUrl, questions }) => {
    console.log(`Image: ${imageUrl}`);
    questions.sort((a, b) => a.createdAt - b.createdAt);
    questions.forEach((q, i) => {
      console.log(`  ${i === 0 ? '[KEEP]' : '[DELETE]'} ${q.id}: "${q.text.substring(0, 50)}..." (${new Date(q.createdAt).toISOString()})`);
    });
    console.log('');
  });
  
  // Delete duplicates (keep the oldest one)
  const toDelete: string[] = [];
  duplicates.forEach(({ questions }) => {
    questions.sort((a, b) => a.createdAt - b.createdAt);
    // Skip first (oldest), delete rest
    for (let i = 1; i < questions.length; i++) {
      toDelete.push(questions[i].id);
    }
  });
  
  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate question(s)...`);
    for (const id of toDelete) {
      await db.collection('questions').doc(id).delete();
      console.log(`  Deleted: ${id}`);
    }
    console.log('Done!');
  }
}

findDuplicates().catch(console.error);
