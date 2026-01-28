import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const db = getFirestore(app);

const QUESTIONS_TO_DELETE = [
  "What made you feel appreciated recently?",
  "What do you want us to be known for?",
  "What moment with me do you want to keep forever?",
  "What do I bring out in you?",
  "If your life was a story someone else was reading, what would make it worth reading?",
  "How do you want to grow together?",
  "What adventure do you want us to take?",
  "What does it mean to know someone?",
];

async function removeSpecificQuestions() {
  console.log(`Deleting ${QUESTIONS_TO_DELETE.length} specific questions...\n`);
  
  const snapshot = await db.collection("questions").get();
  let deleted = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (QUESTIONS_TO_DELETE.includes(data.text)) {
      console.log(`Deleting: "${data.text.substring(0, 50)}..."`);
      await db.collection("questions").doc(doc.id).delete();
      deleted++;
    }
  }

  console.log(`\nDeleted ${deleted} questions`);
}

removeSpecificQuestions().catch(console.error);
