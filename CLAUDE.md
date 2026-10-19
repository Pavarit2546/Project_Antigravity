# CLAUDE.md — Rules for the Room Booking System

## Project overview
This is a small internal room-booking web app.
- Frontend: React (Vite) + react-router-dom
- Backend: Node.js + Express
- Database: SQLite (sqlite3) stored in `backend/data/room.db`
- Auth: JWT (jsonwebtoken) + bcrypt (bcryptjs)

## Repository layout
```
project/
├── CLAUDE.md           # this file
├── plan.md             # build plan / task list
├── spec.md             # product spec
├── package.json        # root: dev scripts (dev, install-all)
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js        # express app + listen
│   │   ├── db.js            # sqlite open + schema init + seed
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT verification middleware
│   │   └── routes/
│   │       ├── auth.js      # register / login
│   │       ├── rooms.js     # rooms CRUD + book/unbook
│   │       └── bookings.js  # my bookings
│   └── data/                # room.db lives here (gitignored)
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js           # fetch helpers
        ├── context/
        │   └── AuthContext.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Rooms.jsx
            └── MyBookings.jsx
```

## Conventions
- 2-space indent, single quotes in JS/JSX, semicolons required.
- Backend routes are thin — validation lives inside the route handler, errors returned as JSON `{ error: "..." }` with the right HTTP status.
- Frontend components are function components (no class components).
- All API calls go through `src/api.js` so token handling stays in one place.
- Auth token is stored in `localStorage` under the key `jwt`.
- Never commit `backend/data/room.db`, `node_modules/`, `.env` or `dist/` (see `.gitignore`).

## Hard rules
- The app must remain a single-page SPA on the frontend; no full page reloads for navigation.
- Every backend endpoint except `POST /api/auth/register` and `POST /api/auth/login` must require a valid JWT.
- Passwords are always hashed with bcrypt before comparing or storing; never store plain-text passwords.
- SQLite is the only database; do not swap it for PostgreSQL/Mongo unless spec changes.
- The React dev server (vite, port 5173) proxies `/api/*` to the backend (port 3000) — keep both running in dev.

## Testing
- Backend has minimal test setup: verify with curl or the Vite proxy.
- Run `npm run dev` from the root — it starts backend (3000) and frontend (5173) together.
- Acceptance criteria live in `spec.md` §9 — use them as the source of truth for "does it work?".

## Commands
- `npm run install-all` — install root + backend + frontend deps
- `npm run dev`          — start backend + frontend concurrently
- `npm run dev:backend`  — start only the Express server
- `npm run dev:frontend` — start only Vite
- `npm test`             — run backend smoke tests (if present)
