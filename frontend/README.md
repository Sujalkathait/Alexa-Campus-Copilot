# Alexa+ Campus Copilot — Frontend 🎓⚡

> Next.js 15, TypeScript, Tailwind CSS v4, and official Google GenAI SDK (`gemini-3.8-flash`).

## ⚡ Quick Run

```bash
# 1. Setup env
cp .env.example .env.local

# 2. Add GEMINI_API_KEY in .env.local
# GEMINI_API_KEY=your_key_here

# 3. Install & Start
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

## 🚀 Key Modules
- **Dashboard:** Deadlines, study hours, velocity metrics, and AI recommendations.
- **AI Campus Assistant:** Gemini 3.8 Flash, SpeechRecognition, text-to-speech audio, and prompt pills.
- **Assignments:** Complete CRUD, priority filters (`HIGH`, `MEDIUM`, `LOW`), card/table view toggle.
- **Study Planner:** 3 algorithmic strategies (Deadline-First, Priority-First, Workload-Balanced) + weekly calendar.
- **Reminders:** Scheduled alerts with 30-min deduplication guard.
- **Analytics:** Weekly focus bar charts and semester velocity tables.
- **Auth & Account:** Sign in, register, 1-click demo student, logout, and double-confirmation **Delete Account**.

## ☁️ Vercel Deployment
1. Set **Root Directory** to `frontend`.
2. Add `GEMINI_API_KEY` to Vercel Environment Variables.
3. Deploy!
