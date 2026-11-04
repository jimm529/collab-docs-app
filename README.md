# Collab Docs

A lightweight collaborative document editor inspired by Google Docs. Built as
a take-home assignment with a deliberately small scope: rich-text document
editing, sharing between users, file import, and persistence.

## Stack

- **Frontend:** React + Vite + Tailwind CSS, Tiptap for rich text editing
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose) — works with MongoDB Atlas or a local MongoDB
- **Auth:** 3 seeded users, JWT-based login (no sign-up flow)
- **Import:** `multer` (upload) + `mammoth` (`.docx` text extraction)
- **Tests:** Jest + Supertest

## Project structure

```
/client   React app (Vite)
/server   Express API
```

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

- `MONGO_URI` — your MongoDB connection string (Atlas or local)
- `JWT_SECRET` — any long random string
- `CLIENT_ORIGIN` — the URL the client dev server runs on (default `http://localhost:5173`)
- `SEED_PASSWORD` — the shared password seeded users will log in with

Seed the three test users, then start the API:

```bash
npm run seed
npm run dev
```

The API listens on `http://localhost:4000` by default.

### 2. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client runs on `http://localhost:5173` by default (Vite will pick another
port if that one is busy — check the terminal output and update
`CLIENT_ORIGIN` on the server accordingly if so).

### 3. Log in

Open the client URL and sign in with any of the seeded accounts:

| Email               | Password                         |
| ------------------- | --------------------------------- |
| alice@example.com   | value of `SEED_PASSWORD` (default `password123`) |
| bob@example.com     | same                              |
| carol@example.com   | same                              |

## Running tests

```bash
cd server
npm test
```

Tests spin up an in-memory MongoDB instance (via `mongodb-memory-server`), so
no real database connection is needed to run them.

## Features

- Create, rename, and edit documents with a Tiptap-based rich text editor
  (bold, italic, underline, H1/H2, bulleted and numbered lists)
- Debounced auto-save
- Dashboard with "Owned by me" / "Shared with me" sections and role badges
- Share a document with another user as an editor or a viewer; access is
  enforced on every server request, not just hidden in the UI
- Import a `.txt`, `.md`, or `.docx` file (max 5MB) as a new document

See [ARCHITECTURE.md](./ARCHITECTURE.md) for what was prioritised and cut,
and [SUBMISSION.md](./SUBMISSION.md) for a checklist of what's included.

## Deployment

- **Backend → Render:** set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN`
  (your deployed frontend URL) as environment variables on the Render service.
- **Frontend → Vercel:** set `VITE_API_URL` to your deployed backend URL as a
  Vercel environment variable.

See `.env.example` in both `/server` and `/client` for the full list of
required variables.
