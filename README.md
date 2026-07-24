# 🤖 PrepAI – AI Resume, Interview & Career Coach

> **An intelligent career preparation platform** powered by Google Gemini AI that analyzes your resume against a job description, identifies skill gaps, generates tailored mock interview questions, and builds a personalized 30-day learning roadmap.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **ATS Resume Audit** | Upload your PDF resume and get instant ATS compatibility & skill match scores |
| 🎯 **Skill Gap Detection** | AI identifies matching and missing skills vs. any target job description |
| 🎤 **AI Mock Interviews** | Practice 10 customized Technical, Behavioral & HR questions with real-time AI scoring |
| 📊 **Answer Evaluation** | Receive 1–10 score, strengths, weaknesses, confidence level & ideal answer for each response |
| 🗓️ **30-Day Roadmap** | Generate a structured week-by-week learning plan with topics, tasks, resources & mini-projects |
| 📁 **Candidate Dashboard** | View past interview sessions, ATS analyses, and saved roadmaps |

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (Express 5)
- **Database**: MongoDB (Mongoose 9) with automatic in-memory fallback via `mongodb-memory-server`
- **AI**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **File Uploads**: Multer (PDF file validation) + `pdf-parse` for text extraction
- **Environment**: `dotenv`

### Frontend
- **Framework**: React 18 (Vite)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Animations**: Canvas Confetti
- **Fonts**: Google Fonts (Outfit + Inter)
- **Design**: Custom glassmorphic dark mode CSS design system

---

## 📁 Project Structure

```
ai_interviewer/
├── server/                    # Express API Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection with in-memory fallback
│   ├── controllers/
│   │   └── apiController.js   # Request handlers for all endpoints
│   ├── middleware/
│   │   └── upload.js          # Multer PDF upload & file validation
│   ├── models/
│   │   ├── User.js
│   │   ├── ResumeAnalysis.js
│   │   ├── Interview.js
│   │   └── Roadmap.js
│   ├── routes/
│   │   └── api.js             # Express router
│   ├── services/
│   │   └── geminiService.js   # Google Gemini AI service layer
│   ├── uploads/               # Temporary file storage (gitignored)
│   ├── .env                   # Environment variables (gitignored)
│   ├── .env.example           # Environment variable template
│   └── index.js               # Express server entry point
│
└── client/                    # React Frontend (Vite)
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ResumeUpload.jsx
    │   │   ├── AnalysisDashboard.jsx
    │   │   ├── MockInterview.jsx
    │   │   ├── RoadmapView.jsx
    │   │   └── HistoryDashboard.jsx
    │   ├── services/
    │   │   └── api.js          # Axios API client wrapper
    │   ├── App.jsx             # Root application component
    │   ├── index.css           # Global design system
    │   └── main.jsx
    └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **A Google Gemini API Key** (free — see below)
- **MongoDB** (optional — app auto-falls back to in-memory if not available)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai_interviewer.git
cd ai_interviewer
```

---

### 2. Get a Free Google Gemini API Key

1. Visit **[Google AI Studio](https://aistudio.google.com/)**
2. Sign in with your Google Account
3. Click **"Create API Key"** → **"Create API key in new project"**
4. Copy the generated key (starts with `AIzaSy...`)

---

### 3. Configure Environment Variables

Copy the example env file and add your API key:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_interviewer
GEMINI_API_KEY=AIzaSyYourActualKeyHere
NODE_ENV=development
```

---

### 4. Install Dependencies & Run

#### Backend (Terminal 1):
```bash
cd server
npm install
npm run dev
```
> You should see: `Server running in development mode on port 5000`

#### Frontend (Terminal 2):
```bash
cd client
npm install
npm run dev
```
> Open: **[http://localhost:5173](http://localhost:5173)**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/uploadResume` | Upload PDF resume, extract text |
| `POST` | `/api/analyzeResume` | ATS analysis vs. job description |
| `POST` | `/api/generateQuestions` | Generate 10 interview questions |
| `POST` | `/api/evaluateAnswer` | Evaluate candidate answer (AI scoring) |
| `POST` | `/api/generateRoadmap` | Generate personalized 30-day learning plan |
| `GET` | `/api/dashboard` | Fetch user history & analytics |
| `GET` | `/api/interview/:id` | Get specific interview session |
| `GET` | `/api/analysis/:id` | Get specific resume analysis |

---

## 🖥️ Application Flow

```
Upload Resume PDF
       ↓
Extract Text (pdf-parse)
       ↓
Paste Job Description
       ↓
Gemini ATS Analysis → Resume Score + ATS Score + Skill Gaps
       ↓
┌──────────────────────────────┐
│   AI Mock Interview          │
│   (10 Tailored Questions)    │
│   ↓ Answer → AI Evaluation  │
│   (Score, Ideal Answer)      │
└──────────────────────────────┘
       ↓
Generate 30-Day Skill Roadmap
       ↓
Review History Dashboard
```

---

## 📄 License

MIT License — feel free to use, modify and distribute.

---

> Built with ❤️ using React, Express, MongoDB & Google Gemini AI
