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

// Known placeholder image
const PLACEHOLDER_URL = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800";

async function removePlaceholderQuestions() {
  console.log("Finding questions with placeholder images...");
  
  const snapshot = await db.collection("questions").get();
  const placeholderQuestions: { id: string; text: string; imageUrl: string }[] = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    // Check for placeholder URL or missing/broken images
    if (
      data.imageUrl === PLACEHOLDER_URL ||
      data.imageUrl?.includes("photo-1518837695005") ||
      !data.imageUrl ||
      data.imageUrl === ""
    ) {
      placeholderQuestions.push({ id: doc.id, text: data.text, imageUrl: data.imageUrl });
    }
  });

  console.log(`Found ${placeholderQuestions.length} questions with placeholder/missing images`);

  // Delete them
  for (const q of placeholderQuestions) {
    console.log(`Deleting: "${q.text?.substring(0, 40)}..."`);
    await db.collection("questions").doc(q.id).delete();
  }

  console.log(`\nRemoved ${placeholderQuestions.length} questions`);
}

removePlaceholderQuestions().catch(console.error);
