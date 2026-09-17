# Mental Wellness Platform

A full-stack mental wellness platform focused on helping young users build healthier emotional habits through guided support, journaling, and AI-powered companionship.

## Project Overview

This repository contains two core applications:

- **`/youth_wellness-front-end`** – a Next.js web app for user onboarding, dashboard experiences, and wellness interactions.
- **`/youth-wellness-mcp-server`** – an Express.js backend that powers chat, diary, speech, and resource APIs.

Together, they provide an integrated experience that includes:

- Secure authentication with Firebase
- AI companion chat
- Daily diary and emotional insights
- Community and wellness resource modules
- Speech-to-text and text-to-speech capabilities

---

## Repository Structure

```text
mental_wellness/
├── youth_wellness-front-end/      # Next.js + TypeScript frontend
└── youth-wellness-mcp-server/     # Node.js + Express backend
```

---

## Tech Stack

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Firebase (client SDK)

### Backend
- Node.js (ESM)
- Express 5
- Firebase Admin SDK
- Google Cloud APIs (Vertex AI, Speech-to-Text, Text-to-Speech, Firestore)

---

## Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/sidddha2004/mental_wellness.git
cd mental_wellness
```

### 2) Set up the frontend

```bash
cd youth_wellness-front-end
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

Run the frontend:

```bash
npm run dev
```

The app runs on **http://localhost:9002** by default.

### 3) Set up the backend

```bash
cd ../youth-wellness-mcp-server
npm install
```

Create a `.env` file:

```env
PORT=8080
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:9002
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
VERTEX_AI_LOCATION=
VERTEX_AI_MODEL=gemini-1.5-pro
FIRESTORE_DATABASE_ID=
```

Run the backend:

```bash
npm run dev
```

Health check: **http://localhost:8080/health**

---

## Available Scripts

### Frontend (`/youth_wellness-front-end`)
- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint frontend code
- `npm run typecheck` – run TypeScript checks

### Backend (`/youth-wellness-mcp-server`)
- `npm run dev` – start with nodemon
- `npm run start` – start production server
- `npm run lint` – lint backend source
- `npm run health-check` – run health check utility

---

## API Highlights

Backend endpoints are organized under:

- `/api/chat`
- `/api/diary`
- `/api/resources`
- `/api/stt`
- `/api/tts`

Additional service endpoints:

- `/health`
- `/api/status`

---

## Notes

- This project uses Firebase authentication and Google Cloud services, so valid credentials are required for full functionality.
- Keep `.env` and `.env.local` files out of version control.

---

## License

MIT
