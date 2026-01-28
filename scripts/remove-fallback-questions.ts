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

async function removeFallbackQuestions() {
  console.log("Finding questions with fallback images...");
  
  const snapshot = await db.collection("questions").get();
  const fallbackQuestions: { id: string; text: string }[] = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.unsplashId?.startsWith("fallback-")) {
      fallbackQuestions.push({ id: doc.id, text: data.text });
    }
  });

  console.log(`Found ${fallbackQuestions.length} questions with fallback images`);

  // Delete them
  for (const q of fallbackQuestions) {
    console.log(`Deleting: "${q.text.substring(0, 40)}..."`);
    await db.collection("questions").doc(q.id).delete();
  }

  console.log(`\nRemoved ${fallbackQuestions.length} questions with fallback images`);
  
  // Print the questions that were removed so we can re-add them
  console.log("\nQuestions to re-add:");
  fallbackQuestions.forEach(q => console.log(`- ${q.text}`));
}

removeFallbackQuestions().catch(console.error);
