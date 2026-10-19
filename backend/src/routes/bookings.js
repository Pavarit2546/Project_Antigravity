import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  db.all(
    `SELECT b.id, b.booked_at AS bookedAt,
            r.id AS roomId, r.name AS roomName, r.room_type AS roomType,
            r.capacity, r.floor, r.description, r.amenities
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
      WHERE b.user_id = ?
      ORDER BY b.booked_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to load bookings' });
      res.json(rows);
    }
  );
});

export default router;
