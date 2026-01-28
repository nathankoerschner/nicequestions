import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);
const storage = getStorage(app);

type Category = "for-crossroads" | "for-loved-ones" | "making-friends" | "big-questions" | "for-a-gathering" | "meet-yourself";

interface QuestionInput {
  text: string;
  category: Category;
}

const questions: QuestionInput[] = [
  // FOR CROSSROADS
  { text: "Will it be beneficial to all concerned?", category: "for-crossroads" },
  { text: "Will it build good will?", category: "for-crossroads" },
  { text: "Will it build better friendships?", category: "for-crossroads" },
  { text: "What would you be willing to give up for it?", category: "for-crossroads" },
  { text: "What wouldn't you be willing to give up for it?", category: "for-crossroads" },
  { text: "What does your gut tell you?", category: "for-crossroads" },
  { text: "What would you tell a friend to do?", category: "for-crossroads" },
  { text: "What are you afraid will happen?", category: "for-crossroads" },
  { text: "What are you hoping will happen?", category: "for-crossroads" },
  { text: "Who will you become through this choice?", category: "for-crossroads" },
  { text: "What will you learn either way?", category: "for-crossroads" },
  { text: "Which path feels like growth?", category: "for-crossroads" },
  { text: "What would you do with nothing to prove?", category: "for-crossroads" },
  { text: "What matters more than being right?", category: "for-crossroads" },
  { text: "What do you need to hear right now?", category: "for-crossroads" },
  { text: "What permission do you need to give yourself?", category: "for-crossroads" },
  { text: "What do you want more than you want to be comfortable?", category: "for-crossroads" },
  { text: "If you had to explain this choice to a child, what would you say matters most?", category: "for-crossroads" },
  { text: "If you met every version of yourself in one room, what would they all agree on?", category: "for-crossroads" },
  { text: "If this was the last chapter of your story, how would you want it to end?", category: "for-crossroads" },
  { text: "If you imagine both futures like movies, which one would you want to star in?", category: "for-crossroads" },
  { text: "If this choice was a bridge, what are you walking toward?", category: "for-crossroads" },
  { text: "If regret was impossible, what would you choose?", category: "for-crossroads" },
  { text: "If this moment was preparing you for something bigger, what might it be teaching you?", category: "for-crossroads" },
  { text: "If this feeling in your chest could talk, what is it trying to tell you?", category: "for-crossroads" },
  { text: "If you were watching your life as a movie, what would you be yelling at the screen?", category: "for-crossroads" },

  // BIG QUESTIONS
  { text: "If a door appeared that led to your best life, what would scare you about walking through?", category: "big-questions" },
  { text: "What is your one thing?", category: "big-questions" },
  { text: "What are your non-negotiables?", category: "big-questions" },
  { text: "What would you do if you knew you could not fail?", category: "big-questions" },
  { text: "How do you want to be remembered?", category: "big-questions" },
  { text: "How do you describe God?", category: "big-questions" },
  { text: "Where do you see the future going, and where do you want it to go?", category: "big-questions" },
  { text: "If you were to think about ten generations forward, what would you do differently or the same today?", category: "big-questions" },
  { text: "What do you believe that you can't prove?", category: "big-questions" },
  { text: "What makes something worth doing?", category: "big-questions" },
  { text: "What would you do with one extra hour each day?", category: "big-questions" },
  { text: "What wisdom would you give your younger self?", category: "big-questions" },
  { text: "What does a life well-lived look like?", category: "big-questions" },
  { text: "What truth are you avoiding?", category: "big-questions" },
  { text: "What would you do if you weren't afraid of wanting it?", category: "big-questions" },
  { text: "If you were an alien given a mission, what are you here on earth to do?", category: "big-questions" },
  { text: "If your life was a story someone else was reading, what would make it worth reading?", category: "big-questions" },
  { text: "If you could only save one thing from your life in a fire, what captures why you're alive?", category: "big-questions" },
  { text: "If pain was a teacher you hired, what is it trying to show you?", category: "big-questions" },
  { text: "If everyone you loved was watching, what would you do differently?", category: "big-questions" },
  { text: "If you wrote your own commandments, what would be sacred to you?", category: "big-questions" },
  { text: "If you could only trust one sense to tell you what's true, which reveals reality?", category: "big-questions" },

  // FOR LOVED ONES
  { text: "When do you feel most loved?", category: "for-loved-ones" },
  { text: "How can I support you this week?", category: "for-loved-ones" },
  { text: "What do you want me to know about you?", category: "for-loved-ones" },
  { text: "What's weighing on you lately?", category: "for-loved-ones" },
  { text: "What made you feel appreciated recently?", category: "for-loved-ones" },
  { text: "How has your heart changed this year?", category: "for-loved-ones" },
  { text: "What do you want to be celebrated for?", category: "for-loved-ones" },
  { text: "What makes you feel safe with me, or in general?", category: "for-loved-ones" },
  { text: "What do you need in order to trust someone?", category: "for-loved-ones" },
  { text: "What does it mean to know someone?", category: "for-loved-ones" },
  { text: "What is your top priority in this season?", category: "for-loved-ones" },
  { text: "What do you wish I understood about you?", category: "for-loved-ones" },
  { text: "What makes you feel distant from me?", category: "for-loved-ones" },
  { text: "What do you miss about us?", category: "for-loved-ones" },
  { text: "What do you want our relationship to become?", category: "for-loved-ones" },
  { text: "When do you feel inspired by me?", category: "for-loved-ones" },
  { text: "What do you need to forgive me for?", category: "for-loved-ones" },
  { text: "How do you want to grow together?", category: "for-loved-ones" },
  { text: "What are you afraid to ask me for?", category: "for-loved-ones" },
  { text: "What do I bring out in you?", category: "for-loved-ones" },
  { text: "What moment with me do you want to keep forever?", category: "for-loved-ones" },
  { text: "What about us makes you smile when you're alone?", category: "for-loved-ones" },
  { text: "What have we created together that matters to you?", category: "for-loved-ones" },
  { text: "What would our life look like if we could design it together?", category: "for-loved-ones" },
  { text: "What adventure do you want us to take?", category: "for-loved-ones" },
  { text: "What small thing do I do that makes your life better?", category: "for-loved-ones" },
  { text: "What do you want us to be known for?", category: "for-loved-ones" },
  { text: "When do you feel most alive with me?", category: "for-loved-ones" },

  // MAKING FRIENDS
  { text: "What is the most valuable thing about friendship?", category: "making-friends" },
  { text: "What is the most challenging thing about friendship?", category: "making-friends" },
  { text: "When did you feel proud of yourself?", category: "making-friends" },
  { text: "What are you looking forward to?", category: "making-friends" },
  { text: "When have you felt truly understood?", category: "making-friends" },
  { text: "What makes you feel closer to people?", category: "making-friends" },
  { text: "What pulls you away from people?", category: "making-friends" },
  { text: "How do you want friends to show up for you?", category: "making-friends" },
  { text: "What is your top priority this month?", category: "making-friends" },
  { text: "Who has shaped who you are?", category: "making-friends" },
  { text: "What do you want that you're not saying out loud?", category: "making-friends" },
  { text: "What desire feels too big to admit?", category: "making-friends" },

  // FOR A GATHERING
  { text: "What's a challenge that you grew through recently?", category: "for-a-gathering" },
  { text: "What is a curiosity on your mind recently?", category: "for-a-gathering" },
  { text: "When did you last surprise yourself?", category: "for-a-gathering" },
  { text: "What's one thing nobody here knows about you?", category: "for-a-gathering" },
  { text: "Who is one person who has shaped who you are?", category: "for-a-gathering" },
  { text: "What is an unexpected miracle you noticed recently?", category: "for-a-gathering" },
  { text: "What do you want to remember from this moment?", category: "for-a-gathering" },
  { text: "What would you try if no one would judge you?", category: "for-a-gathering" },

  // MEET YOURSELF
  { text: "What is a side of yourself that you don't let out often?", category: "meet-yourself" },
  { text: "When do you feel most like yourself?", category: "meet-yourself" },
  { text: "What parts of yourself are you hiding?", category: "meet-yourself" },
  { text: "What are you outgrowing?", category: "meet-yourself" },
  { text: "What does your anger want you to know?", category: "meet-yourself" },
  { text: "What would you defend about yourself?", category: "meet-yourself" },
  { text: "What is a belief you held that has changed over time?", category: "meet-yourself" },
  { text: "What is a belief that has stood the test of time?", category: "meet-yourself" },
  { text: "If you had to defend one belief in front of the universe, what would you fight for?", category: "meet-yourself" },
  { text: "When do you feel like you're faking it?", category: "meet-yourself" },
  { text: "When do you feel like you are free of masks?", category: "meet-yourself" },
  { text: "What are you most proud of in yourself?", category: "meet-yourself" },
  { text: "What do you love most about yourself?", category: "meet-yourself" },
  { text: "Where do you feel inspired to grow?", category: "meet-yourself" },
  { text: "Where do you abandon yourself?", category: "meet-yourself" },
  { text: "What would you do on a day with no plans?", category: "meet-yourself" },
  { text: "When do you feel most free?", category: "meet-yourself" },
  { text: "What does your identity mean to you?", category: "meet-yourself" },
  { text: "What did you used to dream about? Are they still alive?", category: "meet-yourself" },
  { text: "What do you daydream about when you're alone?", category: "meet-yourself" },
  { text: "What life are you curious about living?", category: "meet-yourself" },
  { text: "What do you hope you can say when telling your life story?", category: "meet-yourself" },
  { text: "What are you afraid you'll never get over?", category: "meet-yourself" },
  { text: "What are you afraid people will think?", category: "meet-yourself" },
  { text: "What are you avoiding?", category: "meet-yourself" },
  { text: "If your future self sent you a message, what would it say you're ready for?", category: "meet-yourself" },
  { text: "If you could see your own soul, what would make it beautiful?", category: "meet-yourself" },
  { text: "If your wounds could speak, what wisdom would they offer?", category: "meet-yourself" },
  { text: "If your life was a novel you are reading, what do you think the character is about to realize?", category: "meet-yourself" },
];

// Simple image fetching from Unsplash
async function getUnsplashImage(query: string, usedIds: Set<string>): Promise<{ url: string; unsplashId: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log("No Unsplash key, using placeholder");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );

    if (!response.ok) {
      console.log("Unsplash API error:", response.status);
      return null;
    }

    const data = await response.json();
    
    // Skip if already used
    if (usedIds.has(data.id)) {
      console.log("Skipping duplicate image");
      return null;
    }

    return {
      url: data.urls.regular,
      unsplashId: data.id,
    };
  } catch (error) {
    console.log("Error fetching from Unsplash:", error);
    return null;
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function importQuestions() {
  console.log(`Starting import of ${questions.length} questions...`);
  
  // Get existing questions to check for duplicates
  const existingSnapshot = await db.collection("questions").get();
  const existingTexts = new Set<string>();
  const usedImageIds = new Set<string>();
  
  existingSnapshot.forEach(doc => {
    const data = doc.data();
    existingTexts.add(data.text?.toLowerCase());
    if (data.unsplashId) {
      usedImageIds.add(data.unsplashId);
    }
  });

  console.log(`Found ${existingTexts.size} existing questions`);

  const bucket = storage.bucket();
  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // Skip duplicates
    if (existingTexts.has(q.text.toLowerCase())) {
      console.log(`[${i + 1}/${questions.length}] Skipping duplicate: "${q.text.substring(0, 40)}..."`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${questions.length}] Importing: "${q.text.substring(0, 40)}..."`);

    try {
      // Try to get an image from Unsplash
      const searchTerms = ["contemplation", "nature", "abstract", "minimal", "peaceful"];
      const searchTerm = searchTerms[i % searchTerms.length];
      
      let imageUrl = "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"; // Fallback
      let unsplashId = `fallback-${Date.now()}-${i}`;

      const unsplashResult = await getUnsplashImage(searchTerm, usedImageIds);
      if (unsplashResult) {
        // Download and upload to Firebase
        const imageBuffer = await downloadImage(unsplashResult.url);
        const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const file = bucket.file(filename);
        
        await file.save(imageBuffer, {
          metadata: { contentType: "image/jpeg" },
        });
        
        await file.makePublic();
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        unsplashId = unsplashResult.unsplashId;
        usedImageIds.add(unsplashId);
      }

      // Add to Firestore
      await db.collection("questions").add({
        text: q.text,
        category: q.category,
        imageUrl,
        unsplashId,
        createdAt: Date.now() - (questions.length - i) * 1000, // Stagger timestamps
      });

      imported++;
      existingTexts.add(q.text.toLowerCase());

      // Rate limit for Unsplash (50 requests/hour on free tier)
      if (unsplashResult) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error importing question: ${error}`);
    }
  }

  console.log(`\nImport complete! Imported: ${imported}, Skipped: ${skipped}`);
}

importQuestions().catch(console.error);
