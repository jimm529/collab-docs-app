# Submission

## What's included

- **Auth:** 3 seeded users, `POST /auth/login` returning a JWT. All document
  routes require a valid token.
- **Documents:** create, rename, edit (Tiptap rich text), debounced
  auto-save, reopen. Toolbar: bold, italic, underline, H1, H2, bulleted
  list, numbered list.
- **Dashboard:** "Owned by me" and "Shared with me" sections, each document
  showing an owner / can-edit / view-only badge.
- **Sharing:** owner can grant another seeded user editor or viewer access
  by email. Enforced on the server for every read and write — not just
  hidden in the client UI.
- **Import:** `.txt`, `.md`, `.docx` upload (5MB limit, type validated)
  creates a new editable document.
- **Validation & errors:** 400/401/403/404 returned appropriately across all
  routes, with friendly error messages surfaced in the client UI.
- **Tests:** Jest + Supertest covering the access-control matrix (no access
  → 403, viewer can read but not write, editor/owner can write, only the
  owner can share), the import route (success, unsupported type, missing
  file), and a regression test for a crash bug found during development
  (malformed document id).
- **Docs:** this file, `README.md` (setup/run), `ARCHITECTURE.md`
  (decisions, what was cut), `AI_WORKFLOW.md` (how AI was used to build
  this).
- **Deployment config:** `.env.example` in both `/server` and `/client`,
  ready for Render (backend) and Vercel (frontend).

## Explicitly not included (by design)

- Real-time collaboration (live multi-user co-editing)
- Comments on documents
- Version history

## How to verify

See the "Running tests" and "Features" sections of `README.md` for setup
steps and a manual test checklist.
