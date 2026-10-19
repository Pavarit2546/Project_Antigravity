# AGENTS.md — instructions for AI agents working in this repo

## Project overview
Internal room booking system:
- Frontend: React 18 (Vite) + react-router-dom — SPA in `frontend/`
- Backend: Node.js + Express in `backend/src/server.js` — port 3000
- Database: SQLite via the `sqlite3` package, file at `backend/data/room.db`
- Auth: JWT + bcryptjs
- Source of truth for requirements: `spec.md` (if files conflict, spec.md wins)

## Repository layout
```
project/
├── AGENTS.md / spec.md / plan.md / CLAUDE.md
├── package.json          # root scripts (dev, install-all)
├── backend/
│   ├── package.json      # express, sqlite3, jsonwebtoken, bcryptjs, cors, dotenv, nodemon
│   └── src/
│       ├── server.js     # express app + listen
│       ├── db.js         # opens db, creates schema, seeds (runs on import)
│       ├── middleware/auth.js
│       └── routes/{auth,rooms,bookings}.js
└── frontend/
    ├── vite.config.js    # proxy /api → http://localhost:3000
    └── src/
        ├── main.jsx      # mounts App inside BrowserRouter
        ├── App.jsx       # routes + protected route
        ├── api.js        # fetch wrapper — every API request must go through this file
        ├── context/AuthContext.jsx
        └── pages/{Login,Register,Rooms,MyBookings}.jsx
```

## Hard rules
1. Every endpoint except `POST /api/auth/register` and `POST /api/auth/login` must use the `requireAuth` middleware.
2. Passwords are never stored or logged in plain text — bcrypt hash only.
3. Do not swap SQLite for another database, no class components, no CSS frameworks.
4. Frontend is an SPA — no full page reloads for navigation.
5. Token is stored in `localStorage` under the key `jwt` and sent as `Authorization: Bearer <token>`.
6. Never commit: `node_modules/`, `dist/`, `backend/data/room.db`, `.env` (see `.gitignore`).
7. All frontend API calls go through the helpers in `src/api.js` so token/401 handling lives in one place.

## Conventions
- JS/JSX: 2-space indent, single quotes, semicolons required, trailing commas.
- Backend errors are JSON `{ "error": "..." }` with the right status code:
  - 400 validation failed, 401 missing/invalid token, 403 not the owner, 404 not found, 409 duplicate booking.
- Validation lives inside the route handler (no separate validator modules).
- Function components + hooks only.
- Code, file names, and commit messages are in English.

## Commands (run from repo root)
- `npm run install-all`    — install backend and frontend dependencies
- `npm run dev`            — start backend (3000) + frontend (5173) together
- `npm run dev:backend`    — start only the Express server
- `npm run dev:frontend`   — start only Vite
- Test the API with curl or via http://localhost:5173 (Vite proxies `/api`)

## Testing / verification
- Acceptance criteria live in `spec.md` §9 — they are the definition of "done".
- Happy path to verify: register → login → view rooms → book → see status change → cancel → room free again.
- Before finishing work, run `npm run dev` and smoke-test the happy path per §9.

## Gotchas
- `sqlite3` is a native module — requires Node 18+.
- Schema init and seed run in `db.js` on import — they must be idempotent (`CREATE TABLE IF NOT EXISTS`, seed only when tables are empty).
- Seed must create demo rooms and a demo user: `demo / demo123`.
