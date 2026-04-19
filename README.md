# NutriMind OS 🧬

An AI-powered health intelligence platform that tracks nutrition, adapts to your health goals, and gives personalized meal + workout recommendations — all through natural language.

Built for the **GFD Virtual Prompt War Hackathon**.

---

## What it does

- **Natural language meal logging** — "I ate 200g of chicken" → auto-parses food, calories, macros
- **5 health profiles** — Gym, Diabetes, Weight Loss, Cardiac Care, Custom
- **AI Kitchen** — generates recipes from your pantry based on remaining macro budget
- **Workouts** — goal-specific training plans (hypertrophy, HIIT, diabetic-friendly, cardiac zone 2)
- **Analytics** — BMI, BMR, TDEE, consistency trends, macro distribution charts
- **Full auth system** — signup, email verification, JWT sessions, profile setup

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Express 5, Node.js (ESM) |
| Database | SQLite via better-sqlite3 |
| Auth | JWT + bcryptjs + Nodemailer (Gmail) |

---

## Getting Started

### 1. Clone & install
```bash
git clone <repo-url>
cd nutrimind-ai
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Fill in your values in `.env`:
- `EMAIL_USER` — your Gmail address
- `EMAIL_PASS` — Gmail App Password ([get one here](https://myaccount.google.com/apppasswords))
- `JWT_SECRET` — any long random string
- `PORT` — default `3001`
- `CLIENT_URL` — default `http://localhost:5175`

### 3. Run the app
```bash
# Run both frontend + backend together
npm run dev:all

# Or separately:
npm run server   # backend on :3001
npm run dev      # frontend on :5173
```

---

## Project Structure

```
nutrimind-ai/
├── server/
│   ├── index.js          # Express app entry
│   ├── auth.js           # JWT helpers + middleware
│   ├── db.js             # SQLite setup + schema
│   ├── mailer.js         # Nodemailer email templates
│   └── routes/
│       ├── authRoutes.js # /api/auth — signup, login, verify
│       └── userRoutes.js # /api/user — profile, stats, weight logs
└── src/
    ├── context/
    │   ├── AuthContext.jsx   # User session state
    │   └── GlobalContext.jsx # Nutrition state + AI processing
    ├── services/
    │   └── aiService.js      # Local AI simulator (rule-based)
    ├── components/           # Dashboard, Kitchen, Analytics, etc.
    └── pages/                # Login, Signup, Verify, SetupProfile
```

---

## AI Engine

The AI is a local rule-based engine in `aiService.js` — no external API calls, no cost, works offline. It handles:
- Food recognition + macro calculation from natural language
- Context-aware recipe suggestions based on pantry + remaining macros
- Health profile-specific advice (e.g. carb warnings for diabetics)
- Motivational responses, hydration tips, budget meal planning

---

## Database Schema

- `users` — id, name, email, password_hash, is_verified, verify_token
- `profiles` — user_id, height_cm, weight_kg, gender, health_goal, activity_level
- `meal_logs` — user_id, food_name, calories, protein, carbs, fat, meal_type
- `weight_logs` — user_id, weight_kg, notes, logged_at
