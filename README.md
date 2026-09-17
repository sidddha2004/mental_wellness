# Mental Wellness Platform

A production-style full-stack platform for youth mental wellness, combining a modern web experience with AI-assisted backend services for conversational support, journaling, and voice features.

## Overview

This repository includes two primary applications:

- **`/youth_wellness-front-end`** — Next.js frontend for authentication, dashboard experiences, and user interactions.
- **`/youth-wellness-mcp-server`** — Express backend for chat, diary, wellness resources, and speech APIs.

## Core Capabilities

- Firebase-based authentication and user identity flow
- AI-powered wellness conversations
- Daily diary entries with emotional insight support
- Community/resource-driven wellness content
- Speech-to-Text and Text-to-Speech API integration

## Cloud & AI Integration

The backend is connected to **Google Cloud Platform (GCP)** and is designed for AI-first conversational workflows:

- **Dialogflow-aligned conversational architecture** for seamless chatbot experiences
- **MCP server-based tool connectivity** for backend tool orchestration and extensibility
- **Vertex AI integration** for response generation and sentiment-informed wellness assistance
- **Firestore integration** for chat history, diary data, and structured wellness records

## Repository Structure

```text
mental_wellness/
├── youth_wellness-front-end/      # Next.js + TypeScript frontend
└── youth-wellness-mcp-server/     # Node.js + Express backend
```

## Technology Stack

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Firebase Client SDK

### Backend
- Node.js (ES Modules)
- Express 5
- Firebase Admin SDK
- Google Cloud APIs (Vertex AI, Firestore, Speech-to-Text, Text-to-Speech)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sidddha2004/mental_wellness.git
cd mental_wellness
```

### 2. Frontend Setup

```bash
cd youth_wellness-front-end
npm install
```

Create `.env.local`:

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

Default frontend URL: **http://localhost:9002**

### 3. Backend Setup

```bash
cd ../youth-wellness-mcp-server
npm install
```

Create `.env`:

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

Health endpoint: **http://localhost:8080/health**

## Scripts

### Frontend (`/youth_wellness-front-end`)
- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run start` — run production server
- `npm run lint` — run lint checks
- `npm run typecheck` — run TypeScript checks

### Backend (`/youth-wellness-mcp-server`)
- `npm run dev` — run with nodemon
- `npm run start` — run production server
- `npm run lint` — run ESLint
- `npm run health-check` — execute backend health check utility

## API Surface

Primary backend routes:

- `/api/chat`
- `/api/diary`
- `/api/resources`
- `/api/stt`
- `/api/tts`

Operational routes:

- `/health`
- `/api/status`

## Operational Notes

- Valid Firebase and GCP credentials are required for complete functionality.
- Keep `.env` and `.env.local` out of source control.
- Configure allowed origins before production deployment.

## License

MIT
