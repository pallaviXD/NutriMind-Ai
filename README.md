# NutriMind OS 🧬

> AI-powered personal health intelligence platform — built for the **GFD Virtual Prompt War Hackathon**

NutriMind OS is a full-stack web application that acts as your personal AI health coach. Log meals through natural conversation, get real recipe suggestions from your pantry, track macros and calories in real time, and receive personalized nutrition advice based on your body details, health conditions, and goals — all powered by Llama 3.3 70B via Groq.

---

## Live Demo

> Deployed on Google Cloud Run — [add your Cloud Run URL here after deployment]

GitHub Repository: [https://github.com/pallaviXD/NutriMind-Ai](https://github.com/pallaviXD/NutriMind-Ai)

---

## Features

### AI Chat Coach
- Natural language meal logging — "I had idli sambar and a coffee for breakfast" → auto-parses food, estimates calories and macros, logs to database
- Context-aware responses — AI knows your current calories, macros, pantry, health goal, age, weight, and conditions
- Smart suggestions based on time of day and remaining nutrition targets
- Quick action buttons — Skipped Meal, Ate Junk, Low Budget, High Protein
- Full conversation history maintained per session

### Dashboard (Command Center)
- Live calorie progress ring with animated fill
- Meal cards for Breakfast, Lunch, Dinner, Snacks — update in real time as you chat
- Calorie distribution bar chart
- AI Insights panel — adaptation and behavioral pattern analysis
- Risk meter — Low / Medium / High based on food choices
- Macro distribution pie chart
- Consistency trend line chart
- Water tracker — log glasses consumed (up to 8/day)
- Weight logger — saves to database, shows in analytics

### AI Kitchen
- Add ingredients to your pantry
- Select meal type (breakfast, lunch, dinner, snack)
- AI generates a complete recipe using only your available ingredients
- Recipe includes: name, description, calories, protein, carbs, fat, cook time, full ingredient list with quantities, step-by-step instructions, and a chef's tip
- Respects your health goal and any health conditions

### Health Profile
- Full body details form — gender, date of birth, height, weight, neck/waist/hip measurements, activity level
- Live BMI calculation with category
- Health conditions selector — Hypertension, High Cholesterol, PCOS, Thyroid, Anemia, IBS, Lactose Intolerant, Gluten Intolerant
- 5 health goal presets — Gym & Muscle, Weight Loss, Diabetes Care, Cardiac Health, General Wellness
- AI Food Advice — personalized eat/avoid food lists and tips generated from your exact profile
- All details saved to database and used by AI for personalized responses

### Analytics (Real Data)
- All charts powered by actual meal logs from the database — no fake data
- Calorie trend over 7 / 14 / 30 days
- Macro breakdown (protein, carbs, fat) per day
- Weight trend chart from logged weigh-ins
- Today's calories by meal type
- Logging streak counter
- Total meals logged

### Workouts
- 5 goal-specific workout plans — Hypertrophy Split, Fat-Loss HIIT, Diabetic-Friendly, Cardiac Zone 2, General Wellness
- Expandable exercise cards with sets, reps, rest time, and target muscles
- Nutrition protocols for each goal

### Authentication
- Email + password signup (instant, no email verification required)
- JWT-based sessions stored in localStorage
- Protected routes — redirects to login if unauthenticated
- Profile setup onboarding — body details + health goal before accessing dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling | Tailwind CSS 3.4, Framer Motion 12 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend | Express 5, Node.js 20 (ESM) |
| Database | SQLite via better-sqlite3 |
| AI | Llama 3.3 70B via Groq SDK |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet, express-rate-limit |
| Deployment | Docker + Google Cloud Run |

---

## Project Structure

```
nutrimind-ai/
├── server/
│   ├── index.js              # Express app — security, rate limiting, static serving
│   ├── auth.js               # JWT sign/verify + auth middleware
│   ├── db.js                 # SQLite schema — users, profiles, meal_logs, weight_logs
│   ├── mailer.js             # Nodemailer (optional email)
│   └── routes/
│       ├── authRoutes.js     # POST /signup, POST /login
│       └── userRoutes.js     # profile, stats, chat, recipe, health-advice,
│                             # meal-log, weight-log, analytics
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx   # User session, profile, auth methods
│   │   └── GlobalContext.jsx # Nutrition state, AI processing, meal persistence
│   ├── services/
│   │   └── aiService.js      # Calls /api/user/chat, fallback for offline
│   ├── components/
│   │   ├── Dashboard.jsx     # 3-panel layout
│   │   ├── LeftPanel.jsx     # AI chat interface + quick actions
│   │   ├── CenterPanel.jsx   # Calorie ring, meal cards, distribution chart
│   │   ├── RightPanel.jsx    # Insights, charts, water tracker, weight log
│   │   ├── Kitchen.jsx       # Pantry manager + AI recipe generator
│   │   ├── HealthProfile.jsx # Body details + goal selector + AI food advice
│   │   ├── Analytics.jsx     # Real data charts from database
│   │   ├── Workouts.jsx      # Goal-specific workout plans
│   │   ├── Sidebar.jsx       # Navigation
│   │   └── SystemStatusLayer.jsx # Ambient background effects
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── SetupProfile.jsx  # Onboarding — body details + health goal
│   │   └── VerifyEmailPage.jsx
│   └── App.jsx               # Routes, protected route logic
├── Dockerfile
├── cloudbuild.yaml
├── .env.example
└── vite.config.js            # Vite proxy — /api → localhost:3001
```

---

## Database Schema

```sql
users         — id, name, email, password_hash, is_verified, created_at
profiles      — user_id, height_cm, weight_kg, gender, date_of_birth,
                neck_cm, waist_cm, hip_cm, activity_level, health_goal,
                health_conditions, target_weight_kg
meal_logs     — user_id, food_name, calories, protein, carbs, fat, meal_type, logged_at
weight_logs   — user_id, weight_kg, notes, logged_at
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/user/profile | Get user + profile |
| PUT | /api/user/profile | Update profile details |
| GET | /api/user/stats | BMI, BMR, TDEE, ideal weight |
| POST | /api/user/chat | AI chat (Groq Llama 3.3 70B) |
| POST | /api/user/recipe | Generate AI recipe from pantry |
| POST | /api/user/health-advice | Personalized food advice |
| POST | /api/user/meal-log | Save meal to database |
| GET | /api/user/meal-log | Get recent meal logs |
| POST | /api/user/weight-log | Log weight |
| GET | /api/user/weight-log | Get weight history |
| GET | /api/user/analytics | Real aggregated nutrition data |
| GET | /api/health | Health check |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/pallaviXD/NutriMind-Ai.git
cd NutriMind-Ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
JWT_SECRET=any_long_random_string_here
PORT=3001
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=gsk_your_groq_key_here
```

Getting a Groq API key (free, no credit card):
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google
3. Go to API Keys → Create API Key
4. Copy and paste into `.env`

### 4. Run the app

```bash
# Run both frontend and backend together
npm run dev:all

# Or run separately in two terminals:
npm run server    # backend on :3001
npm run dev       # frontend on :5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment on Google Cloud Run

### Option 1 — Deploy from source (recommended)

Make sure you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated.

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Deploy directly from source (builds and deploys in one command)
gcloud run deploy nutrimind-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars "NODE_ENV=production,JWT_SECRET=your_secret,GROQ_API_KEY=your_groq_key"
```

### Option 2 — Docker build + push

```bash
# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/nutrimind-ai .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/nutrimind-ai

# Deploy to Cloud Run
gcloud run deploy nutrimind-ai \
  --image gcr.io/YOUR_PROJECT_ID/nutrimind-ai \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars "NODE_ENV=production,JWT_SECRET=your_secret,GROQ_API_KEY=your_groq_key"
```

### Option 3 — Cloud Build (CI/CD)

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _JWT_SECRET=your_secret,_GROQ_API_KEY=your_groq_key
```

After deployment, Cloud Run gives you a URL like:
`https://nutrimind-ai-xxxxxxxx-uc.a.run.app`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens. Use a long random string. |
| `GROQ_API_KEY` | Yes | Groq API key for Llama 3.3 70B. Get free at console.groq.com |
| `PORT` | No | Server port. Defaults to 3001. Cloud Run sets this automatically. |
| `NODE_ENV` | No | Set to `production` to enable static file serving and CORS for all origins. |
| `CLIENT_URL` | No | Frontend URL for email links. Defaults to http://localhost:5175 |
| `EMAIL_USER` | No | Gmail address for sending emails (optional feature) |
| `EMAIL_PASS` | No | Gmail App Password (optional feature) |

---

## Security

- HTTP security headers via `helmet`
- Rate limiting — 100 requests/15min general, 20 requests/15min on auth routes
- Passwords hashed with `bcryptjs` (12 salt rounds)
- JWT tokens with 7-day expiry
- Parameterized SQL queries (no SQL injection)
- Request body size limited to 10kb
- CORS restricted to known origins in development

---

## How the AI Works

All AI runs through the backend — no API keys exposed to the browser.

1. User sends a message in the chat
2. Frontend calls `POST /api/user/chat` with the message + full context (calories, macros, meals, pantry, health profile, chat history)
3. Backend loads the user's profile from the database (age, weight, height, conditions)
4. Builds a detailed system prompt with all context
5. Sends to Groq's Llama 3.3 70B with `response_format: json_object`
6. AI returns structured JSON with message + optional dashboard updates (newCalories, newMacros, newMeals)
7. Frontend updates the dashboard in real time
8. If a meal was logged, it's saved to the `meal_logs` table automatically

The same pattern applies to recipe generation (`/api/user/recipe`) and health advice (`/api/user/health-advice`).

---

## Screenshots

> Dashboard — 3-panel layout with AI chat, calorie tracking, and insights

> AI Kitchen — pantry manager with AI-generated recipes

> Health Profile — body details, conditions, and personalized food advice

> Analytics — real data charts from your meal logs

---

## Built With

- [Groq](https://groq.com) — ultra-fast LLM inference
- [Llama 3.3 70B](https://ai.meta.com/blog/llama-3/) — Meta's open-source language model
- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — build tool
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Recharts](https://recharts.org) — data visualization
- [Express](https://expressjs.com) — backend framework
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — database
- [Google Cloud Run](https://cloud.google.com/run) — deployment

---

## License

MIT
