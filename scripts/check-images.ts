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

async function checkImages() {
  console.log("Checking all question images...\n");
  
  const snapshot = await db.collection("questions").get();
  
  const issues: { id: string; text: string; imageUrl: string; issue: string }[] = [];
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const imageUrl = data.imageUrl;
    
    // Check for obvious issues
    if (!imageUrl || imageUrl === "") {
      issues.push({ id: doc.id, text: data.text, imageUrl, issue: "missing" });
      continue;
    }
    
    // Check if image URL is accessible
    try {
      const response = await fetch(imageUrl, { method: "HEAD" });
      if (!response.ok) {
        issues.push({ id: doc.id, text: data.text, imageUrl, issue: `HTTP ${response.status}` });
      }
    } catch (error) {
      issues.push({ id: doc.id, text: data.text, imageUrl, issue: "fetch error" });
    }
  }

  console.log(`Total questions: ${snapshot.size}`);
  console.log(`Questions with image issues: ${issues.length}\n`);
  
  if (issues.length > 0) {
    console.log("Issues found:");
    for (const issue of issues) {
      console.log(`- [${issue.issue}] "${issue.text?.substring(0, 40)}..." - ${issue.imageUrl?.substring(0, 50)}...`);
    }
  }
}

checkImages().catch(console.error);
