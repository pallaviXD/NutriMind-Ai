# NutriMind OS 🧬

> AI-powered personal health intelligence platform — full-stack React + Node.js + Groq Llama 3.3 70B.

NutriMind OS is your personal AI health coach. Log meals through natural conversation, get AI-generated recipes from your pantry, track macros and calories in real time, and receive personalized nutrition advice based on your body, health conditions, and goals.

---

## Live Demo

🚀 **[https://nutrimind-ai-ayi4.onrender.com](https://nutrimind-ai-ayi4.onrender.com)**

💻 GitHub: [https://github.com/pallaviXD/NutriMind-Ai](https://github.com/pallaviXD/NutriMind-Ai)

---

## Features

- **AI Chat Coach** — Log meals in plain English. AI parses food, estimates calories + macros, updates your dashboard live.
- **AI Kitchen** — Add ingredients to your pantry, get a full recipe with macros and steps tailored to your health goal.
- **Real Analytics** — Charts from your actual meal logs. Calorie trends, macro breakdowns, weight history, streak counter.
- **Health Profiles** — Gym, Weight Loss, Diabetes Care, Cardiac Health, General Wellness — AI adapts to each.
- **Body Stats** — BMI, BMR, TDEE, ideal weight range, body fat estimate from your profile.
- **Workout Planner** — AI-generated 7-day plans, cached per profile so it's instant on revisit.
- **Water & Weight Tracking** — Daily water intake logger and persistent weight log with trend charts.
- **Email Verification** — Full token-based email verification flow on signup.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7 |
| Styling | Tailwind CSS 3.4, Framer Motion 12 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Backend | Express 5, Node.js 20 (ESM) |
| Database | Turso (libSQL / cloud SQLite) |
| AI | Llama 3.3 70B via Groq SDK |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | Helmet, express-rate-limit |
| Deployment | Docker + Render |

---

## Project Structure

```
nutrimind-ai/
├── server/
│   ├── index.js              # Express app — security, rate limiting, static serving
│   ├── auth.js               # JWT sign/verify + auth middleware
│   ├── db.js                 # Turso/libSQL schema & async DB client
│   ├── mailer.js             # Nodemailer (optional email verification)
│   └── routes/
│       ├── authRoutes.js     # POST /signup, GET /verify/:token, POST /login
│       ├── userRoutes.js     # profile, stats, chat, recipe, health-advice,
│       │                     # meal-log, weight-log, water-log, analytics
│       └── workoutRoutes.js  # AI workout plan generation + caching
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── SmokeBackground.jsx  # WebGL smoke animation (landing page)
│   │   ├── Dashboard.jsx
│   │   ├── LeftPanel.jsx     # AI chat + quick actions
│   │   ├── CenterPanel.jsx   # Calorie ring, meal cards
│   │   ├── RightPanel.jsx    # Insights, charts, water, weight
│   │   ├── Kitchen.jsx       # Pantry + AI recipe generator
│   │   ├── HealthProfile.jsx # Body details + AI food advice
│   │   ├── Analytics.jsx     # Real data charts
│   │   ├── Workouts.jsx      # AI workout planner
│   │   ├── Sidebar.jsx       # Navigation
│   │   └── SystemStatusLayer.jsx
│   ├── context/
│   │   ├── AuthContext.jsx   # User session, profile, auth methods
│   │   └── GlobalContext.jsx # Nutrition state, AI processing
│   ├── pages/
│   │   ├── LandingPage.jsx   # Public landing page with WebGL smoke hero
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── SetupProfile.jsx
│   │   └── VerifyEmailPage.jsx
│   ├── services/
│   │   └── aiService.js      # Calls /api/user/chat, offline fallback
│   └── App.jsx               # Routes — / landing, /app/* protected
├── Dockerfile
├── render.yaml               # Render deployment config
├── .env.example
└── vite.config.js
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register — sends verification email |
| GET | /api/auth/verify/:token | Verify email token |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/user/profile | Get user + profile |
| PUT | /api/user/profile | Update profile |
| GET | /api/user/stats | BMI, BMR, TDEE, ideal weight |
| POST | /api/user/chat | AI chat (Groq Llama 3.3 70B) |
| POST | /api/user/recipe | AI recipe from pantry |
| POST | /api/user/health-advice | Personalized food advice |
| POST | /api/user/meal-log | Save meal |
| GET | /api/user/meal-log | Recent meals |
| POST | /api/user/weight-log | Log weight |
| GET | /api/user/weight-log | Weight history |
| POST | /api/user/water-log | Log water glasses |
| GET | /api/user/water-log | Today's water count |
| GET | /api/user/analytics | Aggregated nutrition data |
| POST | /api/user/workout-plan | Generate / fetch cached AI workout plan |
| GET | /api/user/workout-plan/latest | Most recent plan |
| GET | /api/health | Health check |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Free [Groq API key](https://console.groq.com) — no credit card needed
- Free [Turso database](https://app.turso.tech) — for persistent storage

### 1. Clone & install

```bash
git clone https://github.com/pallaviXD/NutriMind-Ai.git
cd NutriMind-Ai
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
JWT_SECRET=any_long_random_string_32_chars_min
GROQ_API_KEY=gsk_your_groq_key_here
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token
PORT=3001
CLIENT_URL=http://localhost:5173
```

Leave `TURSO_*` empty to use a local SQLite file for dev.

### 3. Run

```bash
npm run dev:all      # frontend + backend together
# or separately:
npm run server       # backend :3001
npm run dev          # frontend :5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment (Render)

This project ships with a `render.yaml` blueprint.

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo
3. Render detects the Dockerfile automatically
4. Add env vars in the dashboard:
   - `GROQ_API_KEY`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CLIENT_URL` (your Render URL, set after first deploy)
   - Use **Generate** for `JWT_SECRET`
5. Deploy

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Long random string for signing JWTs |
| `GROQ_API_KEY` | Yes | Groq API key for Llama 3.3 70B |
| `TURSO_DATABASE_URL` | Prod | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Prod | Turso auth token |
| `PORT` | No | Defaults to 3001 locally, set by platform in prod |
| `CLIENT_URL` | No | Frontend URL for email links |
| `EMAIL_USER` | No | Gmail for email verification |
| `EMAIL_PASS` | No | Gmail App Password |

---

## Security

- HTTP headers via `helmet`
- Rate limiting — 100 req/15min general, 20 req/15min on auth
- Passwords hashed with `bcryptjs` (12 rounds)
- JWT tokens — 7 day expiry
- Parameterized queries — no SQL injection
- Body size limited to 10kb
- No API keys exposed to the browser

---

## How the AI Works

All AI runs server-side — no keys in the browser.

1. User sends a message
2. Frontend calls `POST /api/user/chat` with message + full context (calories, macros, meals, pantry, profile, chat history)
3. Backend fetches user profile from Turso
4. Builds system prompt with all context
5. Calls Groq Llama 3.3 70B with `response_format: json_object` + retry/backoff
6. AI returns structured JSON with message + optional dashboard updates
7. Frontend updates dashboard in real time
8. Logged meals are saved to Turso automatically

---

## License

MIT
