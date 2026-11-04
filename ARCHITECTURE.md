# Architecture

## Overview

A standard two-tier app: a React SPA talking to an Express/Mongoose REST API,
with JWT bearer auth. No real-time layer — "collaboration" here means
asynchronous sharing with role-based access, not live multi-cursor editing.

```
client (React + Tiptap) --HTTP (JWT)--> server (Express) --Mongoose--> MongoDB
```

## Key decisions

- **Content stored as Tiptap JSON, not HTML.** Tiptap's native document
  format round-trips cleanly through the editor with no parsing step, and
  avoids any HTML-sanitization concerns on the server.
- **Access control is enforced entirely server-side**, on every read and
  write route, independent of what the client UI shows or hides. A viewer's
  PATCH request is rejected with 403 even if someone calls the API directly.
  The client UI (disabling the editor, hiding the toolbar) is a convenience
  layer on top of that, not the actual security boundary.
- **A single `getRole(doc, userId)` helper** (`server/src/utils/access.js`)
  is the one place that decides whether a user is the owner, an editor, a
  viewer, or has no relationship to a document. Every route calls this
  instead of re-deriving access logic inline, so there's one source of truth
  for "who can do what."
- **Import is intentionally lossy.** `.docx` files are converted to plain
  text via `mammoth`, then split into one Tiptap paragraph per line — no
  attempt is made to preserve bold/headings/formatting from the source file.
  This keeps the importer simple and predictable, matching the assignment's
  "deliberately small" scope.
- **Debounced auto-save, not a save button.** The editor calls `PATCH
  /documents/:id` ~1 second after the user stops typing, rather than on every
  keystroke or requiring an explicit save action.
- **Seeded users instead of real sign-up.** Three users are created by a seed
  script with a shared, documented password. There's no registration flow,
  password reset, or email verification — out of scope for a 4-6 hour
  assignment focused on documents and sharing.

## What was prioritised

1. Correct, server-enforced access control (owner / editor / viewer) — this
   was treated as the most important thing to get right, since it's the part
   most likely to have a subtle bug (and the part the automated tests focus
   on).
2. A working end-to-end flow: log in, create a document, edit it, see it
   auto-save, share it, have the shared user see the right thing.
3. Import, as a secondary feature once the core flow worked.

## What was cut

Explicitly out of scope, per the assignment:

- **Real-time collaboration** (no CRDT/OT, no live cursors or presence) —
  this alone is normally a multi-day project; the assignment scope treats
  sharing + access control as the collaboration feature, not live co-editing.
- **Comments** on documents.
- **Version history** / undo-across-sessions. Editors only have the standard
  in-session undo/redo Tiptap provides for free.

Smaller things cut or simplified to keep the scope tight:

- No rich formatting preservation on `.docx` import (see above).
- No pagination on the dashboard document lists — fine at the scale a
  take-home demo runs at, would need to be added for a real multi-user
  deployment.
- No email verification, password reset, or account management — seeded
  users only.
- No virus/content scanning on uploaded files beyond type and size checks.

## A bug found and fixed during development

While testing, a malformed document ID in a URL (e.g. `/documents/abc`) was
found to crash the entire Node process — Mongoose throws a `CastError` when
asked to query by an invalid ObjectId, and since the route handlers were
plain `async` functions, that rejection was never caught and became an
unhandled promise rejection, which Node terminates the process on. Fixed by
(1) wrapping every async route handler in a small `asyncHandler` utility that
forwards rejections to Express's error middleware, and (2) validating the
`:id` route parameter up front and returning a clean 404 for anything that
isn't a valid ObjectId, rather than letting it reach the database layer at
all. A regression test (`a malformed document id returns 404 instead of
crashing`) locks this in.
