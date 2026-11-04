# AI Workflow

This project was built with Claude (Anthropic's Claude Code) as an AI pair
programmer, working directly in the repository.

## How it was used

- **Scaffolding and implementation.** Claude wrote the server (models, auth
  middleware, routes, access-control logic) and client (pages, API client,
  Tiptap editor integration) directly, following an explicit spec covering
  the stack, API shape, data models, and feature list.
- **Build order.** Work proceeded in the order specified: server
  models/auth → document routes → sharing/access control → automated tests →
  client → import → polish → docs — rather than jumping around.
- **Live verification, not just "looks right."** After the server routes
  were written, Claude ran the Jest/Supertest suite to check the access-
  control behaviour (403 for strangers, read-only for viewers, write access
  for editors/owner). After the client was built, Claude actually ran the
  app — a temporary in-memory MongoDB, the real Express server, and a real
  Vite dev server — and drove it through a headless browser: logging in as
  each seeded user, creating and editing a document, formatting text,
  sharing it, and confirming a viewer genuinely cannot edit (not just that
  the UI hides the toolbar).
- **Bugs were found and fixed through that testing, not assumed away.**
  Three real issues surfaced this way and were fixed before calling the work
  done:
  1. A malformed document ID in a URL crashed the entire server process
     (unhandled promise rejection from an uncaught Mongoose `CastError`).
     Fixed with an `asyncHandler` wrapper and id validation, plus a
     regression test.
  2. The editor's `onUpdate` handler could fire — and attempt an autosave —
     as a side effect of the app loading a document's content into the
     editor, not just from the user typing. Harmless for an owner (it just
     re-saves the same content) but could race with the UI for a viewer.
     Fixed by guarding the save callback on the user's actual edit
     permission, regardless of what triggered it.
  3. A stale `@tiptap/extension-underline` import duplicated functionality
     already bundled in the installed Tiptap StarterKit version, producing a
     console warning. Removed.
- **Scope discipline.** Per the brief, Claude did not add features beyond
  the list (no real-time collaboration, comments, or version history), and
  kept changes scoped to what each build step asked for.

## What a human should still review

- The actual MongoDB Atlas connection, Render/Vercel deployment, and
  environment variable configuration were not performed by Claude (no cloud
  credentials were available in this session) — see the Deployment section
  of `README.md` for the steps to do this.
- `.docx` import was exercised through the server's automated tests (with a
  mocked extraction step) and the `.txt`/`.md` import paths were verified
  against the live server; a real-world `.docx` file is worth trying once
  against the deployed app as a final sanity check.
- As with any AI-assisted code, a human review pass before relying on this
  in a real context is expected — this submission is a take-home assignment
  demo, not production software.
