import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function deleteRandom(count: number) {
  const snapshot = await db.collection('questions').get();
  const docs = snapshot.docs;
  
  console.log(`Total questions: ${docs.length}`);
  
  // Shuffle and pick random ones
  const shuffled = docs.sort(() => Math.random() - 0.5);
  const toDelete = shuffled.slice(0, count);
  
  console.log(`\nDeleting ${toDelete.length} random questions:\n`);
  
  for (const doc of toDelete) {
    const data = doc.data();
    console.log(`  Deleting: "${data.text?.substring(0, 50)}..."`);
    await db.collection('questions').doc(doc.id).delete();
  }
  
  console.log(`\nDone! ${docs.length - count} questions remaining.`);
}

deleteRandom(10).catch(console.error);
