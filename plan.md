# plan.md — Build plan for the Room Booking System

Working top-down. Each task is small enough to finish in one sitting and leaves the repo in a runnable state.

## Phase 1 — Scaffold
- [ ] Create root `package.json` with dev scripts (`install-all`, `dev`, `dev:backend`, `dev:frontend`)
- [ ] Create `backend/` with `package.json` (express, sqlite3, jsonwebtoken, bcryptjs, cors, dotenv)
- [ ] Create `frontend/` with Vite React scaffold (vite, react, react-dom, react-router-dom)
- [ ] Vite config proxies `/api` to `http://localhost:3000`
- [ ] Add `.gitignore` (node_modules, dist, backend/data/*.db, .env)

## Phase 2 — Database
- [ ] `backend/src/db.js` opens SQLite at `backend/data/room.db`
- [ ] Create tables: users, rooms, bookings (see spec §5)
- [ ] Enforce UNIQUE(room_id) and UNIQUE(user_id) on bookings
- [ ] Seed a few demo rooms + a demo user on first run
- [ ] Enable WAL mode

## Phase 3 — Auth
- [ ] `backend/src/routes/auth.js`
  - POST /api/auth/register → hash password, insert user, return JWT
  - POST /api/auth/login → verify password, return JWT
- [ ] `backend/src/middleware/auth.js` — reads `Authorization: Bearer <token>`, attaches `req.user`, 401 on bad/missing token
- [ ] Wire JWT secret from `process.env.JWT_SECRET` with a dev fallback

## Phase 4 — Rooms + bookings
- [ ] `backend/src/routes/rooms.js`
  - GET /api/rooms → list all rooms with `bookedBy` (user's username) + `userId` (NULL if free)
  - POST /api/rooms → add a new room
  - POST /api/rooms/:id/book → create booking (409 if already booked)
  - DELETE /api/rooms/:id/book → cancel booking (403 if not the owner)
- [ ] `backend/src/routes/bookings.js`
  - GET /api/bookings/me → the caller's bookings

## Phase 5 — Frontend shell
- [ ] `frontend/src/main.jsx` mounts App inside BrowserRouter
- [ ] `frontend/src/App.jsx` defines routes and ProtectedRoute
- [ ] `frontend/src/context/AuthContext.jsx` — login/logout/register, token in localStorage, exposes { user, token, loading }
- [ ] `frontend/src/api.js` — get/post/delete helpers that inject the bearer token

## Phase 6 — Frontend pages
- [ ] `pages/Login.jsx` — form + link to Register
- [ ] `pages/Register.jsx` — form, auto-redirects to / on success
- [ ] `pages/Rooms.jsx` — table of rooms, status badge, reserve/cancel buttons, add-room form
- [ ] `pages/MyBookings.jsx` — list of the caller's bookings

## Phase 7 — Polish
- [ ] Minimal CSS (system font, card layout, status colours: green = free, red = booked)
- [ ] README.md with run instructions and a quick API table
- [ ] Smoke-test the full happy path (register → login → see rooms → book → cancel)

## Definition of done
- `npm run install-all && npm run dev` works end-to-end on a fresh clone
- Every AC in `spec.md` §9 passes
