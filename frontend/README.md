# Alexa+ Campus Copilot — Frontend Application 🎓⚡

> **Next.js 15, TypeScript, Tailwind CSS, and Official Google GenAI SDK (`gemini-3.8-flash`)**  
> Designed following Linear, Stripe, and Notion dark navy design aesthetics.

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` in this directory:
```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

Add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🌟 Key Modules

- **Dashboard:** Welcome greeting, KPI cards, urgent deadlines, and AI study recommendations.
- **AI Campus Assistant:** Google GenAI SDK (`gemini-3.8-flash`), speech recognition, text-to-speech audio, and prompt pills.
- **Assignments:** CRUD coursework manager, priority filters, and card/table view toggle.
- **Study Planner:** 3 algorithmic planning strategies (Deadline-First, Priority-First, Workload-Balanced) with weekly calendar matrix.
- **Reminders:** Scheduled notifications with 30-min deduplication guard.
- **Analytics:** Weekly focus distribution bar charts and semester completion velocity.
- **Settings:** Profile preferences, timezone selector, and Account Security Danger Zone.
- **Authentication:** Student sign in, registration, 1-click demo student sign-in, safe logout, and double-confirmation **Delete Account** data wipe.

---

## ☁️ Vercel Deployment

1. Set **Root Directory** to `frontend`.
2. Add `GEMINI_API_KEY` to **Environment Variables** in the Vercel dashboard.
3. Deploy!
