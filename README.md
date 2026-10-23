# Alexa+ Campus Copilot 🎓⚡

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google GenAI SDK](https://img.shields.io/badge/Google_GenAI-Gemini_3.8_Flash-8e75ff?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **The Commercial-Grade Academic Productivity & Workflow SaaS for University Students.**  
> Unifying assignment tracking, automated study schedules, countdown timers, intelligent reminders, and a voice-powered AI campus copilot in a sleek Linear/Stripe/Notion-inspired dark aesthetic.

---

## 📑 Table of Contents

1. [Quick Summary (TL;DR)](#-quick-summary-tldr)
2. [Product Overview & Problem Solved](#-product-overview--problem-solved)
3. [System Architecture Diagram](#-system-architecture-diagram)
4. [Quickstart Guide (Easy 3-Step Setup)](#-quickstart-guide-easy-3-step-setup)
   - [Option 1: Frontend Only (Recommended)](#option-1-frontend-only-recommended)
   - [Option 2: Full-Stack (Next.js + Python FastAPI)](#option-2-full-stack-nextjs--fastapi)
5. [Platform Command Reference & Hotkeys](#-platform-command-reference--hotkeys)
6. [The 7 Core Academic Modules](#-the-7-core-academic-modules)
7. [The 13 UI/UX Design Laws Applied](#-the-13-uiux-design-laws-applied)
8. [Google Gemini API Integration & Security](#-google-gemini-api-integration--security)
9. [Sample Voice & Text Prompts](#-sample-voice--text-prompts)
10. [Design Patterns & Architecture](#-design-patterns--architecture)
11. [Vercel Deployment Walkthrough](#-vercel-deployment-walkthrough)
12. [Project Directory Tree](#-project-directory-tree)
13. [API Endpoints Reference](#-api-endpoints-reference)
14. [Design Tokens & UI Theme Palette](#-design-tokens--ui-theme-palette)
15. [Environment Variables Matrix](#-environment-variables-matrix)
16. [Troubleshooting & Frequently Asked Questions (FAQ)](#-troubleshooting--frequently-asked-questions-faq)
17. [License & Acknowledgments](#-license--acknowledgments)

---

## ⚡ Quick Summary (TL;DR)

- **What is it?** An all-in-one AI academic assistant and study scheduler built specifically for university students.
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **AI Core:** Google Gemini (`gemini-3.8-flash`) via the official `@google/genai` SDK with built-in quota caching and sliding-window rate limiting.
- **Backend (Optional):** Python FastAPI with SQLite/PostgreSQL, SQLAlchemy, and clean Domain-Driven Design patterns.
- **Voice Support:** Two-way voice interaction using Web Speech Recognition and SpeechSynthesis Text-to-Speech (TTS).
- **Zero Config Demo:** Click the **"Demo Student"** button on the login modal to test instantly without creating an account.

---

## 🌟 Product Overview & Problem Solved

College students face persistent friction organizing coursework across disconnected spreadsheets, LMS portals, and notes apps:
- **Missed assignment deadlines** leading to avoidable grade penalties and last-minute panic.
- **Poor time estimation** causing students to either overwork or procrastinate on heavy problem sets.
- **Unstructured study sessions** resulting in burnout during midterm and final exam weeks.
- **Fragmented tools** requiring students to juggle three to four separate productivity applications.

**Alexa+ Campus Copilot** eliminates this friction through a unified command center:
1. **AI Understands & Plans:** Students talk or type in natural language; Gemini translates unstructured thoughts into actionable academic items.
2. **Algorithms Schedule:** The scheduler applies deadline proximity, subject difficulty, and study breaks to generate realistic blocks.
3. **Graceful Offline Engine:** If offline or without an API key, built-in heuristic datasets keep all 7 core modules 100% interactive.

---

## 🗺️ System Architecture Diagram

```mermaid
flowchart TD
    User([Student / User]) -->|Voice / Click / Keyboard| UI[Next.js 15 Frontend UI]
    UI -->|Quick Search ⌘K| Palette[Global Command Palette]
    UI -->|Microphone Audio| SpeechRec[Web Speech Recognition API]
    UI -->|Audio Response| TTS[SpeechSynthesis Engine]

    subgraph Presentation & Serverless Layer
        UI -->|POST /api/chat| ServerlessRoute[Next.js API Route Handler]
        ServerlessRoute --> RateLimiter[Sliding-Window Limiter (20 req/min)]
        RateLimiter --> CacheEngine[LRU Cache (10-min TTL)]
        CacheEngine --> GoogleSDK[Official Google GenAI SDK]
        GoogleSDK -->|gemini-3.8-flash| GeminiAPI[(Google Gemini Cloud API)]
        ServerlessRoute -->|Fallback on Quota Exceeded| HeuristicEngine[Built-in Copilot Heuristics]
    end

    subgraph Python FastAPI Backend (Optional)
        UI -->|Proxy /api/*| FastAPIRouter[FastAPI REST API Router]
        FastAPIRouter --> Dispatcher[Command Dispatcher Pattern]
        Dispatcher --> StrategyEngine[Study Planning Strategies]
        StrategyEngine -->|Deadline / Priority / Balance| Scheduler[Calendar Matrix Engine]
        Dispatcher --> EventBus[Domain Event Bus]
        EventBus --> ActivityFeed[Live Activity Feed Logger]
        Dispatcher --> Repositories[Repository Pattern]
        Repositories --> DB[(SQLite / PostgreSQL)]
    end
```

---

## 🚀 Quickstart Guide (Easy 3-Step Setup)

### System Requirements
- **Node.js:** v18.18+ or v20.x+ ([Download Node.js](https://nodejs.org/)).
- **Python:** v3.11+ (only needed if running the optional FastAPI backend).
- **Gemini API Key:** Free tier from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

### Option 1: Frontend Only (Recommended)

The frontend is a complete standalone web application with built-in serverless routes and seeded coursework datasets.

#### Step 1: Open Terminal & Navigate to Frontend
```bash
cd frontend
```

#### Step 2: Configure Your API Key
Copy the template and paste your Google Gemini API key:
```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# macOS or Linux
cp .env.example .env.local
```

Inside `frontend/.env.local`, set your secret key:
```env
# Google Gemini API Key (Server-side only — NEVER use NEXT_PUBLIC_ prefix)
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Step 3: Install & Launch
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

### Option 2: Full-Stack (Next.js + FastAPI)

Run both the Python backend (with SQLite database and event bus) and Next.js frontend concurrently.

#### Terminal 1 — Start Python FastAPI Backend:
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python -m venv .venv

# 3. Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger documentation is live at `http://127.0.0.1:8000/docs`.*

#### Terminal 2 — Start Next.js Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## ⌨️ Platform Command Reference & Hotkeys

### Terminal Commands

| Action | Windows PowerShell | macOS / Linux |
| :--- | :--- | :--- |
| **Clone Repository** | `git clone https://github.com/Sujalkathait/Alexa-Campus-Copilot.git` | `git clone https://github.com/Sujalkathait/Alexa-Campus-Copilot.git` |
| **Enter Frontend** | `cd "Alexa+ Campus Copilot\frontend"` | `cd "Alexa+ Campus Copilot/frontend"` |
| **Setup Environment** | `Copy-Item .env.example .env.local` | `cp .env.example .env.local` |
| **Install Packages** | `npm install` | `npm install` |
| **Dev Server** | `npm run dev` | `npm run dev` |
| **Production Build** | `npm run build` | `npm run build` |
| **Production Start** | `npm run start` | `npm run start` |

### Keyboard Shortcuts in Web App

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `⌘ + K` or `Ctrl + K` | Open Universal Command Palette | Global |
| `Esc` | Close active modal dialog or command palette | Global |
| `Tab` / `Shift + Tab` | Accessible keyboard focus navigation | Global |
| `Space` | Toggle audio playback / speech synthesizer | AI Assistant |

---

## 🧩 The 7 Core Academic Modules

### 1. Academic Dashboard
- **Welcome Banner:** Dynamic greeting displaying the student name, semester week, and current date.
- **4 Real-Time Metrics:** Pending deadlines count, hours planned today, completion velocity %, and productivity score (0-100).
- **Proactive AI Recommendation:** Highlights the top urgent assignment and suggests optimal study hours.
- **Today's Schedule:** Quick list of today's study sessions with one-click completion toggles.

### 2. AI Campus Assistant (Gemini 3.8 Flash)
- **Official Google GenAI SDK:** Communicates with Google's `gemini-3.8-flash` model via secure server routes.
- **Voice Recognition:** Microphone toggle with live waveform animation and speech recognition status.
- **Voice Synthesis:** Reads AI recommendations aloud with dedicated speech toggle controls.
- **Tool Action Badges:** Automatically identifies when tasks are added, plans generated, or reminders scheduled.
- **Suggested Prompt Pills:** Fast 1-click prompts (*"Plan 2 hours tonight"*, *"Explain Virtual Memory"*).

### 3. Coursework & Assignment Manager
- **Full CRUD:** Create, view, edit, and delete coursework items with subject tags and estimated effort.
- **Priority Categorization:** Categorize items into `HIGH`, `MEDIUM`, and `LOW` priority badges.
- **Dual View Modes:** Seamlessly toggle between rich Responsive Cards and high-density Table View.
- **Dynamic Timers:** Relative countdown timers (e.g. `Due in 24h` or pulsing `OVERDUE` badges).

### 4. Smart Study Planner
- **3 Algorithmic Planning Strategies:**
  - **Deadline-First:** Prioritizes coursework closest to deadline to protect semester grades.
  - **Priority-First:** Schedules high-stakes exams and credit-heavy assignments before smaller tasks.
  - **Workload-Balanced:** Distributes study sessions evenly across subjects with built-in restorative intervals.
- **Target Hours Slider:** Adjust scheduled daily hours from 30 minutes up to 6 hours.
- **Weekly Schedule Grid:** 7-day visual matrix with interactive preview and save functionality.

### 5. Intelligent Reminders
- **Submission Alerts:** Schedule time-sensitive reminder notifications tied to assignments and quizzes.
- **30-Min Deduplication Guard:** Automatically prevents duplicate reminders created within a 30-minute window.
- **Status Controls:** Mark alerts delivered, reset notifications, or cancel them with ease.

### 6. Academic Productivity Analytics
- **Weekly Focus Bar Chart:** Visual bar charts comparing daily study hours against semester goals.
- **Subject Distribution:** Color-coded distribution showing workload percentages across academic subjects.
- **Coursework Velocity Table:** Historical tracking of assigned tasks, completions, and velocity rates.

### 7. Student Profile, Auth & Danger Zone
- **Student Profile:** Full name, university email, academic major, and graduation year.
- **1-Click Demo Sign-In:** Instant evaluation as *Alex Morgan* (B.S. Computer Science) with one click.
- **User Session Pill:** Navbar avatar pill showing student initials, online status, and session menu.
- **Double-Confirmation Account Deletion:** Requires students to type `"DELETE"` before wiping local data.

---

## 🧠 The 13 UI/UX Design Laws Applied

| Law / Principle | Practical Implementation in Alexa+ Campus Copilot |
| :--- | :--- |
| **1. Visual Hierarchy** | High-contrast status badges (`#f43f5e`, `#3b82f6`) stand out against deep navy backgrounds (`#0a0d14`, `#0f1422`). Typography scales logically from `text-2xl` headings down to monospace tags. |
| **2. Gestalt Principles** | **Common Regions & Proximity:** Related controls are enclosed within distinct 1px bordered cards (`border-slate-800`). Form inputs sit directly below their labels. |
| **3. Hick's Law** | Eliminates decision fatigue. Navigation is structured into exactly 7 focused tabs; the Study Planner simplifies scheduling down to 3 clear strategies. |
| **4. Fitts's Law** | Primary action buttons (`+ New Assignment`, `Generate Plan`, `Sign In`) feature generous touch targets (44px+ height) positioned along natural cursor trajectories. |
| **5. Jakob's Law** | Uses familiar SaaS conventions: top-right user avatar dropdown, left sidebar navigation, top search bar with `⌘K` / `Ctrl+K`, and standard modal dialog patterns. |
| **6. Miller's Law** | Information is chunked into groups of 3–5 items per view (e.g., 4 metric KPI cards, 3 planning strategies, 4 suggestion pills). |
| **7. Recognition over Recall** | Contextual search, recent chat history, active filter pills, and quick suggestions prevent users from having to remember past inputs. |
| **8. Immediate Feedback** | Immediate visual feedback for all interactions: active button transforms, live soundwave animations during voice input, loading skeletons, and floating toast notifications. |
| **9. Affordance** | Solid primary fills, distinct focus rings (`focus:border-blue-500 focus:ring-1`), hover border illumination, and explicit cursor indicators. |
| **10. Progressive Disclosure** | Essential task details are shown first; danger zones (Delete Account), rubrics, and advanced settings expand only upon request. |
| **11. Error Prevention & Recovery** | Accidental account deletion is prevented by requiring explicit typed verification (`"DELETE"`). Action buttons remain disabled until the confirmation phrase matches. |
| **12. Accessibility (WCAG 2.2 AA)** | 4.5:1 contrast ratios on dark mode, full keyboard navigation (`Tab`, `Esc`, `⌘K`), and visible focus indicators. |
| **13. Cognitive Load Reduction** | Strips out generic templates, random glassmorphism, and oversized headers in favor of a clean Linear/Stripe dark aesthetic. |

---

## 🔒 Google Gemini API Integration & Security

### Security Architecture
- **Zero Frontend Leakage:** The `GEMINI_API_KEY` is accessed exclusively on the server in `src/app/api/chat/route.ts`. It is **never** prefixed with `NEXT_PUBLIC_` and never sent to client browsers.
- **Git Protection:** Both `.env` and `.env.local` files are strictly excluded from version control via `.gitignore`.

### Rate Limiting & Quota Management
- **Sliding-Window Rate Limiter:** Protects against abuse by capping requests at 20 queries per minute per IP. Returns `429 Too Many Requests` with `Retry-After` headers.
- **In-Memory LRU Cache:** Exact queries (e.g. *"Explain Virtual Memory"*) are cached for 10 minutes to save API tokens and avoid redundant calls.
- **Strict Token Limits:** Input queries are capped at 1,000 characters, history is limited to 4 turns, and responses are constrained to `800` output tokens.
- **Resilient Fallback Engine:** If Google's API returns a 429 quota limit or temporary 503 spike, Campus Copilot automatically catches the error and provides built-in academic recommendations without crashing.

```typescript
// Official Google GenAI SDK Usage (Server-Side Only)
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: sanitizedPrompt,
  config: { maxOutputTokens: 800, temperature: 0.7 },
});
```

---

## 🎙️ Sample Voice & Text Prompts

| User Speaks or Types | Intelligent Action Taken by Copilot |
| :--- | :--- |
| *"Plan my study for 2.5 hours tonight."* | Generates study blocks for upcoming assignments and adds them to today's schedule. |
| *"Remind me about the Operating Systems paper tomorrow at 9 AM."* | Checks deduplication guard and schedules an alert with status badge. |
| *"Add CS301 Problem Set due Friday, high priority, 120 minutes."* | Creates assignment record with deadline timer badge and tags. |
| *"Explain Dijkstra's algorithm for my midterm."* | Provides structured technical summary with time complexity breakdown. |
| *"What assignments are due in the next 48 hours?"* | Queries open assignments and summarizes overdue and urgent deadlines. |

---

## 🏛️ Design Patterns & Architecture

The application is structured around 5 industry-standard design patterns:

```text
├── Strategy Pattern      -> Pluggable study schedule algorithms (DeadlineFirst, PriorityFirst, WorkloadBalance)
├── Adapter Pattern       -> GeminiAdapter conforming to unified AIProvider protocol
├── Repository Pattern    -> Decoupled data access layer with 30-min window reminder deduplication
├── Command Pattern       -> Safe dispatch of AI tool calls (CreateAssignmentCommand, GeneratePlanCommand)
└── Observer Pattern      -> Domain Event Bus notifying real-time activity feeds
```

1. **Strategy Pattern (`PlanningStrategy`):** Decoupled scheduling algorithms allow dynamic swapping between Deadline-First, Priority-First, and Workload-Balanced strategies.
2. **Adapter Pattern (`AIProvider`):** Standardizes external AI providers (Google Gemini and Offline Fallback) behind a unified interface.
3. **Repository Pattern:** Separates database access from business rules while implementing automated 30-minute reminder deduplication.
4. **Command Pattern (`CommandDispatcher`):** Validates and executes natural-language AI tool invocations through safe, typed commands.
5. **Observer Pattern (`EventBus`):** Emits asynchronous domain events (`AssignmentCreatedEvent`, `PlanGeneratedEvent`) to maintain live activity feed logs.

---

## ☁️ Vercel Deployment Walkthrough

Campus Copilot is deployment-ready for **Vercel** with zero custom configuration.

```
GitHub Repository ──> Vercel Build (Next.js 15) ──> Serverless Deployment
```

### 4-Step Vercel Deployment:
1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Navigate to [Vercel Dashboard](https://vercel.com/new) and click **"Import Project"**.
3. Select your `Alexa-Campus-Copilot` repository:
   - **Framework Preset:** Next.js
   - **Root Directory:** Click Edit and select `frontend`
   - **Environment Variables:** Add `GEMINI_API_KEY` with your secret key from Google AI Studio.
4. Click **Deploy**! Your site is live in under 90 seconds.

> **Zero Dependency Guarantee:** When deployed standalone on Vercel without the Python server, the frontend automatically utilizes its built-in serverless API route and fallback datasets—all 7 sections function completely with zero broken buttons.

---

## 📁 Project Directory Tree

```text
Alexa+ Campus Copilot/
├── backend/                              # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                          # REST API Endpoints
│   │   │   ├── assignments.py            # Assignment CRUD routes
│   │   │   ├── chat.py                   # Chat orchestrator route
│   │   │   ├── dashboard.py              # Summary statistics
│   │   │   ├── reminders.py              # Reminder management
│   │   │   └── study_plans.py            # Study planning routes
│   │   ├── application/
│   │   │   ├── commands/                 # Command Pattern handlers
│   │   │   └── services/                 # Domain Services
│   │   ├── core/
│   │   │   ├── config.py                 # Pydantic v2 Settings (GEMINI_API_KEY)
│   │   │   └── database.py               # SQLAlchemy database engine
│   │   ├── domain/
│   │   │   ├── entities/models.py        # User, Assignment, Session, Reminder
│   │   │   ├── events/                   # Domain Event Bus & Observers
│   │   │   └── strategies/               # Strategy Pattern planning algorithms
│   │   └── infrastructure/
│   │       ├── ai/                       # GeminiAdapter
│   │       └── repositories/             # Repository Pattern data layers
│   ├── tests/                            # Pytest Test Suite (20/20 Passing)
│   ├── requirements.txt                  # Python dependencies
│   └── run.py                            # Backend entrypoint
│
├── frontend/                             # Next.js 15 TypeScript Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/chat/route.ts         # Server-Side Gemini Route Handler
│   │   │   ├── globals.css               # Tailwind CSS v4 & theme variables
│   │   │   ├── layout.tsx                # Next.js App Router Root Layout
│   │   │   └── page.tsx                  # Master Viewport Orchestrator
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx            # Header with search & user dropdown
│   │   │   │   └── Sidebar.tsx           # Left navigation & weekly goals
│   │   │   ├── modules/
│   │   │   │   ├── analytics/            # Productivity charts & velocity tables
│   │   │   │   ├── assignments/          # Coursework cards, tables & modals
│   │   │   │   ├── auth/                 # AuthModal & DeleteAccountModal
│   │   │   │   ├── chat/                 # AI Assistant with voice waveform
│   │   │   │   ├── dashboard/            # KPI cards & recommendations
│   │   │   │   ├── planner/              # Multi-strategy calendar planner
│   │   │   │   ├── reminders/            # Scheduled alerts & deduplication
│   │   │   │   └── settings/             # Student profile & danger zone
│   │   │   └── ui/                       # Reusable Toast, Modal, Dialogs
│   │   ├── hooks/
│   │   │   ├── useToast.ts               # Toast alert state management
│   │   │   └── useVoice.ts               # Web Speech Recognition & TTS
│   │   ├── services/
│   │   │   └── api.ts                    # Centralized API service & offline dataset
│   │   └── types/
│   │       └── index.ts                  # TypeScript Domain Interfaces
│   ├── .env.example                      # Safe environment template
│   ├── next.config.mjs                   # Next.js configuration & rewrites
│   ├── package.json                      # Next.js 15, React 19, @google/genai
│   ├── tsconfig.json                     # Strict TypeScript configuration
│   └── vercel.json                       # Vercel deployment configuration
│
├── .gitignore                            # Root Git ignore rules
└── README.md                             # Master documentation (500 lines)
```

---

## 📡 API Endpoints Reference

### Next.js Serverless Route (Frontend)

| Method | Endpoint | Description | Payload Sample |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | AI Chat with Gemini & tool calling | `{"message": "Plan study for 2 hours", "conversation_history": []}` |

### FastAPI REST Endpoints (Backend)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and database connectivity check |
| `GET` | `/api/dashboard/summary` | Fetch dashboard KPIs, urgent tasks, and today's schedule |
| `GET` | `/api/assignments` | Query assignments with optional `?status=` and `?priority=` filters |
| `POST` | `/api/assignments` | Create a new assignment with estimated minutes |
| `PATCH` | `/api/assignments/{id}` | Update assignment completion or syllabus details |
| `DELETE` | `/api/assignments/{id}` | Delete assignment record |
| `POST` | `/api/study-plans/generate` | Generate algorithmic study plan with selected strategy |
| `GET` | `/api/reminders` | Query active and pending reminders |
| `POST` | `/api/reminders` | Schedule reminder with automated 30-min deduplication guard |

---

---

## 🎨 Design Tokens & UI Theme Palette

| Token Role | Hex Code | Tailwind Equivalent | Purpose / Application |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | #0a0d14 | g-[#0a0d14] | Deep space canvas background |
| **Card Surface** | #0f1422 | g-[#0f1422] | Cards, modals, and navigation sidebars |
| **Electric Blue** | #3b82f6 | 	ext-blue-500 / g-blue-600 | Primary action buttons and active indicators |
| **Aura Violet** | #8b5cf6 | 	ext-violet-400 / g-violet-600 | AI copilot highlights and recommendation pills |
| **Status Emerald** | #10b981 | 	ext-emerald-400 | Completed items and high productivity metrics |
| **Warning Amber** | #f59e0b | 	ext-amber-400 | Medium priority tasks and 24-48h deadlines |
| **Danger Rose** | #f43f5e | 	ext-rose-400 | Overdue assignments and account deletion |
| **Subtle Border** | #1e293b | order-slate-800 | Crisp 1px container delineation |

---

## ⚙️ Environment Variables Matrix

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| GEMINI_API_KEY | Yes (for AI) | None | Secret Google AI Studio API key |
| NODE_ENV | Automatic | production | Environment mode managed by Next.js & Vercel |
| NEXT_PUBLIC_APP_NAME | Optional | Alexa+ Campus Copilot | Display branding title for application headers |
| PORT | Optional | 3000 | Local development port override |

## ❓ Troubleshooting & Frequently Asked Questions (FAQ)

#### Q1: Where do I get a free Gemini API key?
**Answer:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey), sign in with your Google account, and click **"Create API Key"**. Paste the key into `frontend/.env.local`.

#### Q2: What happens if I don't have a Gemini API key yet?
**Answer:** Campus Copilot includes an intelligent offline academic engine. All 7 tabs, scheduling algorithms, and study plan generators continue working seamlessly using realistic offline academic models.

#### Q3: Why doesn't the microphone button activate voice recognition?
**Answer:** The voice assistant requires the standard Web Speech Recognition API. Ensure you are using a modern browser (Google Chrome, Microsoft Edge, Brave, or Safari) and click **"Allow"** when prompted for microphone permissions.

#### Q4: How do I test the full backend test suite?
**Answer:** In the `backend` directory with your virtual environment activated, run `pytest -v`. All 20 unit and integration tests will execute and pass in under 0.5s.

#### Q5: Can I deploy the frontend without running the Python backend?
**Answer:** Yes. The Next.js frontend has built-in serverless API route handlers and fallback datasets, making it 100% functional when deployed standalone to Vercel.

#### Q6: How do I test the account deletion feature safely?
**Answer:** Open **Settings**, scroll down to the red **Danger Zone**, and click **"Delete Account"**. A safety modal will appear requiring you to type `"DELETE"` before permanently clearing local data.

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See `LICENSE` for details.

- **Design Inspiration:** Linear, Stripe, Notion, and Raycast.
- **AI Engine:** Google Gemini Cloud Platform (`gemini-3.8-flash`).
- **Icons:** [Lucide Icons](https://lucide.dev/).

**Engineered with ❤️ for college students striving for academic excellence.**
