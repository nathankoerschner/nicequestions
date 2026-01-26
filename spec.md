# nicequestions.com

A simple, beautiful app for collecting and sharing good questions.

---

## Overview

Each question lives on a card with art on one side and the question on the other. Users browse a masonry grid of cards (art side up), click to reveal questions, and can submit their own.

---

## Tech Stack

- **Frontend:** Next.js with static generation + serverless functions
- **Hosting:** Vercel
- **Database & Storage:** Firebase (Firestore for questions, Firebase Storage for images)
- **AI Services:** OpenAI
  - GPT for question validation, cleanup, and categorization
  - DALL-E for image generation

---

## Core Features

### 1. Browse Experience

- **Layout:** Single-scroll page with masonry grid
- **Cards:** Display art side up, varied aspect ratios creating a collage effect
- **Mobile:** Maintains masonry layout (not single column)
- **Filtering:** Filter by category tags (shown as filter options)

### 2. Card Interaction

**Click to reveal:**
1. Card animates from grid position to full screen
2. Brief pause
3. Card flips with 3D animation to reveal the question

**Question side:**
- Deep black solid background
- Clean sans-serif typography (e.g., Inter, Söhne)
- Question text centered

### 3. Sharing

- **URL format:** `nicequestions.com/question/42` (sequential numbering)
- **Share method:** Native Share API (device share sheet)
- **Shared link experience:**
  1. Card appears small (as if in grid)
  2. Zooms up to full screen
  3. Pauses
  4. Flips to reveal the question
  5. After reveal: subtle CTA appears ("Explore more questions" / "Submit your own")

### 4. Submit a Question

**Entry point:** Floating button (persistent, corner of screen)

**Flow:**
1. User enters their question
2. Question sent to OpenAI for processing:
   - **Validation:** Check if appropriate (not spam, actually a question)
   - **Cleanup:** Fix spelling and grammar only (preserve submitter's voice)
   - **Categorization:** Assign to one of the fixed categories
3. If rejected: gentle generic message ("This doesn't seem like a great fit")
4. If approved: generate image via DALL-E
5. **Surprise reveal:** User sees full card flip animation with their question + generated art
6. Share prompt appears

**Identity:** Fully anonymous (no per-user tracking, relies on LLM filtering)

---

## Daily Limits (Cost Control)

Platform-wide limits (not per-user):

- **100 submission attempts per day** — after 100 total attempts (including rejections), the submit form closes for everyone
- **50 accepted questions per day** — even if attempts remain, no more than 50 questions can be published

When limits are reached, show a friendly message: "We've reached our limit for today. Come back tomorrow!"

Limits reset at midnight UTC. Track counts in Firebase.

---

## Categories

Fixed set, assigned by LLM:

- **for crossroads** — questions for life decisions and transitions
- **for loved ones** — questions to deepen relationships
- **making friends** — questions to connect with new people
- **big questions** — philosophical and existential questions
- **for a gathering** — quick questions for groups
- **meet yourself** — self-reflection and personal discovery

---

## Art Style

Images are **unrelated to question content** — purely aesthetic. Generate fresh image per submission.

**Visual direction for DALL-E prompts:**
- Realistic nature photography — people playing and exploring outdoors
- Black and white photography with dramatic shadows
- Simple daily acts — a hand flipping a book page, a cup of coffee, feet walking, hands holding
- Cinematic lighting
- Varied aspect ratios (square, portrait, landscape) for collage variety
- Mix of color and B&W

---

## Visual Design

**Overall aesthetic:** Bold, editorial

**Grid:** Masonry layout with varied card sizes based on image aspect ratio

**Question display:**
- Deep black background
- White text
- Clean sans-serif font
- Centered

---

## Data Model

### Question
```
{
  id: number (auto-increment),
  question: string,
  originalQuestion: string (before cleanup),
  category: string,
  imageUrl: string,
  imageAspectRatio: string (e.g., "1:1", "3:4", "4:3"),
  createdAt: timestamp
}
```

---

## API Endpoints

### POST /api/submit
- Receives: `{ question: string }`
- Process: validate → cleanup → categorize → generate image → store
- Returns: `{ success: boolean, question?: QuestionObject, error?: string }`

### GET /api/questions
- Query params: `category` (optional filter)
- Returns: array of questions, newest first

### GET /api/question/[id]
- Returns: single question by ID

---

## Admin

No admin UI. Manage directly via Firebase console if needed.

---

## Launch State

- No seed data — starts empty
- First real submissions are the first questions

---

## Domain

Hosted at **nicequestions.com** (already purchased)
