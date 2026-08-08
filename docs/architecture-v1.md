# Nexora Frontend V1 - Technical Documentation & Requirements

## Overview
Nexora Frontend is built as a high-performance, modern web application providing an immersive, voice-first AI Mock Interview platform. It manages authentication, user state, interview setup, real-time interview rooms, and detailed candidate scorecards.

---

## Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router, Server Components & Client Components) |
| **Language** | TypeScript 5+ |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Glassmorphism Design System |
| **Animations** | Motion (`motion/react`) |
| **Data Visualization** | Recharts (Scores, radar charts, candidate metrics) |
| **Authentication & DB** | `@supabase/ssr`, `@supabase/supabase-js` |
| **Real-time Voice** | LiveKit WebRTC Components (`@livekit/components-react`) |

---

## Authentication & User Flow

```
[ Unauthenticated User ]
       │
       ▼
 [ /login Page ] ──── (Email/Password or Google/GitHub OAuth)
       │
       ▼
 [ Supabase Auth ] ─── Issue Session Cookies & Supabase JWT
       │
       ▼
 [ Next.js Middleware ] ─── Protected Routes Check
       │
       ├────────► /ai-mock-interview (Setup Interview)
       ├────────► /ai-mock-interview/room (Voice Room)
       └────────► /reports/[id] & /history
```

1. **Client & Server Auth Helpers**:
   - Browser Client: `lib/supabase/client.ts`
   - Server Client: `lib/supabase/server.ts`
   - PKCE OAuth Handler: `app/auth/callback/route.ts`
2. **Session Persistence**:
   - `@supabase/ssr` automatically manages HTTP-only cookies across client and server renders.
3. **Route Protection**:
   - Root `middleware.ts` refreshes expired sessions and redirects unauthenticated users away from `/ai-mock-interview`, `/reports`, and `/history`.

---

## Page Structure & Core Flows

### 1. Landing Page (`/`)
- Minimalist hero section showcasing voice AI capabilities.
- Live demo preview, features highlight, pricing tiers, and footer.

### 2. Login & Sign-Up (`/login`)
- Dual-mode card (Sign in / Create Account).
- Google & GitHub OAuth buttons.
- Email + Password input with validation & error states.

### 3. Interview Setup (`/ai-mock-interview`)
- Step-by-step form:
  - Role selection (e.g., Fullstack, Backend, Frontend, DevOps).
  - Experience level (Junior, Mid, Senior, Lead).
  - Interview type (Technical Deep Dive, System Design, Behavioral).
  - Optional Resume upload (PDF) & Job Description text.

### 4. Real-time Interview Room (`/ai-mock-interview/room`)
- Audio visualization wave & voice indicator.
- Live transcript stream.
- LiveKit WebRTC connection using a room token requested from FastAPI.
- Controls: Mute/Unmute microphone, End Interview button.

### 5. Report & History (`/reports/[id]` & `/history`)
- Comprehensive score Breakdown: Technical, Communication, Problem Solving, Confidence.
- Radar chart & score rings.
- Strong points, weak points, and actionable improvement recommendations.

---

## Integration with Python Backend

All API calls from Next.js to the FastAPI Python backend include the user's **Supabase Bearer JWT**:

```ts
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch("http://localhost:8000/interview/token", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${session?.access_token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ role, experience_level, type }),
});
```

---

## Environment Variables (`.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
