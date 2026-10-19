# Room Booking System

An internal room-booking web app. Users register/log in, see which rooms are free or booked, book a room, and cancel their booking.

## Stack
- Frontend: React 18 (Vite) + react-router-dom — `frontend/`
- Backend: Node.js + Express — `backend/` (port 3000)
- Database: SQLite (`sqlite3`) — `backend/data/room.db`
- Auth: JWT + bcrypt

## Run

Requires Node 18+.

```bash
npm install          # root (concurrently)
npm run install-all  # backend + frontend deps
npm run dev          # starts backend (3000) + frontend (5173)
```

Open http://localhost:5173 — Vite proxies `/api` to the backend.

A demo user is seeded on first run: `demo` / `demo123`.

## API

| Method | Endpoint             | Auth | Description                                    |
| ------ | -------------------- | ---- | ---------------------------------------------- |
| POST   | /api/auth/register   | -    | `{username, password}` → 201 `{token, user}`   |
| POST   | /api/auth/login      | -    | `{username, password}` → 200 `{token, user}`   |
| GET    | /api/rooms           | JWT  | All rooms with `status` and `bookedBy`         |
| POST   | /api/rooms           | JWT  | `{name, roomType}` → create room               |
| POST   | /api/rooms/:id/book  | JWT  | Book a room → 201 (409 if taken)               |
| DELETE | /api/rooms/:id/book  | JWT  | Cancel booking → 204 (403 if not the owner)    |
| GET    | /api/bookings/me     | JWT  | Current user's bookings                        |

## Environment
- `JWT_SECRET` — secret for signing tokens (a dev fallback is used if unset; set it in production).

Spec: `spec.md` · Build plan: `plan.md` · Agent rules: `AGENTS.md`
