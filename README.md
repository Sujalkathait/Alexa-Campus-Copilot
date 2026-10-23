# Alexa+ Campus Copilot 🎓⚡

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google GenAI](https://img.shields.io/badge/Google_GenAI-Gemini_3.8_Flash-8e75ff?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> An AI-powered academic productivity platform for college students. Unifies coursework deadlines, automated study schedules, smart reminders, and voice-assisted tutoring into a single Linear/Stripe-inspired interface.

---

## ⚡ Quick Start (How to Run)

### 1. Run Frontend (Next.js 15 + Gemini AI)

```bash
cd frontend

# Setup Environment File
cp .env.example .env.local    # Windows: Copy-Item .env.example .env.local

# Install & Run
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **Gemini API Setup:** Add your free key in `frontend/.env.local`:
> ```env
> GEMINI_API_KEY=your_gemini_api_key_here
> ```
> Get key: [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 2. (Optional) Run Python FastAPI Backend

```bash
cd backend
python -m venv .venv

# Activate venv:
# Windows: .\.venv\Scripts\activate | Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API Docs: `http://127.0.0.1:8000/docs`

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Academic Dashboard** | Priority deadline countdowns, completion velocity tracking, and AI study recommendations. |
| **AI Campus Assistant** | Voice-enabled chat powered by the official **Google GenAI SDK** (`gemini-3.8-flash`) with action badges and audio TTS. |
| **Assignments Manager** | Complete CRUD with priority filters (`HIGH`, `MEDIUM`, `LOW`), search, and Card/Table views. |
| **Smart Study Planner** | 3 algorithmic strategies (**Deadline-First**, **Priority-First**, **Workload-Balanced**) + weekly calendar matrix. |
| **Intelligent Reminders** | Submission alerts with automated 30-minute deduplication guards. |
| **Productivity Analytics** | Weekly focus distribution charts, subject allocation percentages, and semester velocity. |
| **Auth & Security** | Student login, registration, 1-click demo sign-in, safe logout, and double-confirmation **Delete Account**. |

---

## 🎨 UI/UX Design System & Laws

Built strictly adhering to commercial SaaS principles:

- **Visual Hierarchy:** Critical alerts and overdue badges use high-contrast accents (`#f43f5e`, `#3b82f6`) on deep navy backgrounds (`#0a0d14`).
- **Hick's Law:** Exactly 7 focused navigation tabs and 3 clear planning strategies to eliminate decision fatigue.
- **Fitts's Law:** Generous touch targets (44px+ height) on all interactive CTAs.
- **Jakob's Law:** Familiar top-right user menu, left sidebar, and standard `⌘K` / `Ctrl+K` command search.
- **Error Prevention (Delete Account):** Double-confirmation requiring students to type `"DELETE"` before account data is permanently erased.
- **Accessibility:** WCAG 2.2 AA compliant contrast, full keyboard navigation, and visible focus rings.

---

## 🔒 Google Gemini API Architecture

- **Server-Side Security:** API route at `src/app/api/chat/route.ts` ensures `GEMINI_API_KEY` is **never** exposed to browser clients.
- **Sliding-Window Rate Limiting:** 20 requests per minute per IP to protect against abuse.
- **In-Memory LRU Caching:** 10-minute cache for identical queries to save tokens and quota.
- **Token Constraints:** Prompts sanitized (max 1,000 chars), history limited to 4 turns, `maxOutputTokens: 800`.
- **Graceful Quota Handling:** Catches 429 quota exhaustion or 503 spikes and serves built-in academic recommendations without app crashes.

---

## ☁️ Vercel Deployment (3 Steps)

1. Push to GitHub:
   ```bash
   git push origin main
   ```
2. In [Vercel Dashboard](https://vercel.com/new), import repository and set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `GEMINI_API_KEY` = your Google AI Studio key.
4. Click **Deploy**.

---

## 🧪 Testing & Verification

```bash
# Frontend build & type check (0 errors)
cd frontend && npm run build

# Backend unit & integration test suite (20/20 passing)
cd backend && pytest -v
```

---

## 📄 License

MIT © 2026 [Sujal Kathait](https://github.com/Sujalkathait). Engineered for academic excellence.
