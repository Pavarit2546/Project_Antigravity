# spec.md — ระบบจองห้องพักภายใน (Internal Room Booking System)

## 1. ปัญหาและเป้าหมาย
ภายในองค์กรมีห้องพักที่ใช้ร่วมกันหลายห้อง แต่ไม่มีระบบติดตามว่าห้องไหนว่างหรือมีคนจองแล้ว ทำให้เกิดความซ้ำซ้อนและจองทับกัน ระบบนี้ช่วยให้ผู้ใช้ลงทะเบียน จอง และยกเลิกการจองห้องออนไลน์ได้อย่างถูกต้อง พร้อมดูสถานะห้องแบบ real-time

## 2. ผู้ใช้และ user stories
- ผู้ใช้ทั่วไป: ฉันต้องการลงทะเบียนและ login เพื่อเข้าถึงหน้าจองห้อง
- ผู้ใช้ทั่วไป: ฉันต้องการดูรายชื่อห้องทั้งหมดพร้อมสถานะว่าง/จอง เพื่อเลือกห้องได้ถูก
- ผู้ใช้ทั่วไป: ฉันต้องการจองห้องว่างเพื่อมั่นใจว่าจะใช้ห้องได้
- ผู้ใช้ทั่วไป: ฉันต้องการยกเลิกการจองของฉันเองเมื่อไม่ได้ใช้ห้อง
- ผู้ดูแล (admin): ฉันต้องการเพิ่มห้องใหม่เข้าสู่ระบบ

## 3. ขอบเขต
- ทำ:
  - register / login (JWT)
  - ดูรายการห้องพร้อมสถานะ free/booked และชื่อคนจอง
  - จองห้อง / ยกเลิกการจอง (เฉพาะเจ้าของการจอง)
  - ดูประวัติการจองของตนเอง
  - เพิ่มห้องใหม่
- ไม่ทำ:
  - การจองแบบระบุช่วงเวลา/ปฏิทิน (จอง = ครอบครองห้อง 1 คนเท่านั้น)
  - ระบบ payment / เงิน
  - อนุมัติ/ปฏิเสธการจอง (จองได้ทันทีถ้าห้องว่าง)
  - role-based UI แยก admin (endpoint เพิ่มห้องเปิดให้ทุก user ที่ login เพื่อความง่าย)

## 4. Functional requirements
- FR-1 ผู้ใช้ลงทะเบียนด้วย username + password (username ต้อง unique)
- FR-2 ผู้ใช้ login ได้ด้วย username + password ที่ถูกต้อง และได้รับ JWT กลับ
- FR-3 หน้า rooms แสดงทุกห้องพร้อม status: `free` หรือ `booked` และชื่อผู้จอง (ถ้ามี)
- FR-4 ผู้ใช้ที่ login แล้วจองห้อง `free` ได้ ระบบตอบ 201
- FR-5 การจองห้องที่ `booked` อยู่ได้รับ 409 และห้องไม่สามารถจองซ้ำได้ (unique constraint ใน DB)
- FR-6 เจ���าของการจองยกเลิกการจองได้ (204); คนอื่นที่ยกเลิกได้รับ 403
- FR-7 ผู้ใช้ดูรายการการจองของตนเองพร้อมชื่อห้องได้
- FR-8 เพิ่มห้องใหม่ด้วยชื่อ + ประเภท (เช่น meeting, lounge)
- FR-9 endpoint ทุกตัว (ยกเว้น register/login) ต้องมี JWT ที่ถูกต้อง มิฉะนั้นตอบ 401

## 5. ข้อมูล (data model)
- users(id INTEGER PK, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT)
- rooms(id INTEGER PK, name TEXT UNIQUE NOT NULL, room_type TEXT NOT NULL, created_at TEXT)
- bookings(id INTEGER PK, room_id INTEGER NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE, user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, booked_at TEXT)
  - UNIQUE(room_id) => ห้อง 1 ห้อง จองได้แค่ 1 คน
  - UNIQUE(user_id) => 1 คน จองได้ 1 ห้อง (ง่ายต่อการจัดการ)

## 6. หน้าจอ / endpoint
หน้าจอ (SPA):
- `/login`, `/register`: ฟอร์ม auth
- `/rooms`: การ์ดห้องทั้งหมด — สีเขียว = ว่าง, แดง = จอง + ปุ่มจอง/ยกเลิก
- `/bookings`: รายการห้องที่ฉันจองอยู่

API:
- POST /api/auth/register {username, password} → 201 {token, user}
- POST /api/auth/login {username, password} → 200 {token, user}
- GET /api/rooms → 200 [{id, name, roomType, status, bookedBy, userId}]
- POST /api/rooms {name, roomType} → 201 {id, ...}
- POST /api/rooms/:id/book → 201 | 409
- DELETE /api/rooms/:id/book → 204 | 403 | 404
- GET /api/bookings/me → 200 [{id, room: {...}, bookedAt}]

## 7. Tech stack และข้อจำกัด
- Frontend: React 18 (Vite) + react-router-dom, fetch API
- Backend: Node.js + Express
- Database: SQLite (แพ็กเกจ sqlite3), ไฟล์ `backend/data/room.db`
- Auth: JWT (jsonwebtoken) + bcryptjs
- ห้ามใช้: class components, framework CSS หนัก (ใช้ plain CSS), database อื่นที่ไม่ใช่ SQLite
- Dev: Vite proxy `/api` → `http://localhost:3000`

## 8. Non-functional
- ความปลอดภัย: password hash ด้วย bcrypt, JWT secret จาก env `JWT_SECRET` (มี fallback สำหรับ dev เท่านั้น), endpoint ทั้งหมดต้อง verify token
- ข้อมูลส่วนบุคคล: เก็บแค่ username + password hash, ไม่เก็บ email/phone
- ประสิทธิภาพ: ตารางเล็ก ใช้ index ตาม default ของ PK/UNIQUE พอ, เปิด WAL mode

## 9. Acceptance criteria
- AC-1 Given ผู้ใช้ใหม่ When POST register แล้ว POST login ด้วยชื่อ/รหัสเดียวกัน Then ได้รับ token และเข้าหน้า rooms ได้
- AC-2 Given login สำเร็จ When GET /api/rooms แล้วทุกห้องมี field status และ bookedBy (null ถ้าว่าง)
- AC-3 Given ห้อง free When เจ้าของ login แล้ว POST /api/rooms/:id/book Then ได้ 201 และห้องกลายเป็น status "booked" พร้อมชื่อผู้จอง
- AC-4 Given ห้องถูกจองแล้ว When user อีกราย POST /api/rooms/:id/book Then ได้ 409
- AC-5 Given ห้องที่ฉันจอง When DELETE /api/rooms/:id/book โดยฉันเอง Then ได้ 204 และห้องกลับเป็น free; เมื่อคนอื่น DELETE ได้ 403
- AC-6 Given ไม่มี token When เรียก GET /api/rooms Then ได้ 401
- AC-7 Given ฉันจองห้อง When GET /api/bookings/me Then รายการห้องที่จองแสดงครบ
- AC-8 Given POST /api/rooms {name, roomType} When สำเร็จ Then ห้องใหม่แสดงในหน้า rooms

## 10. Tasks
1. โครงโปรเจกต์ root + scripts (package.json, .gitignore) — done (มีอยู่แล้ว)
2. Backend: db.js (schema + seed), server.js, middleware/auth.js
3. Backend: routes auth.js, rooms.js, bookings.js
4. Frontend: Vite scaffold, AuthContext, api.js, pages Login/Register/Rooms/MyBookings
5. CSS + README + smoke test ตาม AC ทั้งหมด
