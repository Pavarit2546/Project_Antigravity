import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function fetchRooms(res) {
  db.all(
    `SELECT r.id, r.name, r.room_type AS roomType,
            r.capacity, r.floor, r.description, r.amenities,
            b.user_id AS userId, u.username AS bookedBy
       FROM rooms r
       LEFT JOIN bookings b ON b.room_id = r.id
       LEFT JOIN users u ON u.id = b.user_id
      ORDER BY r.name`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to load rooms' });
      res.json(rows.map((row) => ({
        ...row,
        status: row.userId ? 'booked' : 'free',
      })));
    }
  );
}

router.get('/', (req, res) => fetchRooms(res));

router.post('/', (req, res) => {
  const { name, roomType, capacity, floor, description, amenities } = req.body || {};
  if (!name || !name.trim() || !roomType || !roomType.trim()) {
    return res.status(400).json({ error: 'Room name and type are required' });
  }
  const trimmedCapacity = capacity === undefined || capacity === '' ? null : Number(capacity);
  if (trimmedCapacity !== null && (!Number.isInteger(trimmedCapacity) || trimmedCapacity <= 0)) {
    return res.status(400).json({ error: 'Capacity must be a positive whole number' });
  }
  const optional = (value) => (value === undefined || value === '' ? null : String(value).trim());
  const trimmedAmenities = optional(amenities);
  if (trimmedAmenities) {
    const list = trimmedAmenities.split(',').map((a) => a.trim()).filter(Boolean);
    if (list.length === 0) {
      return res.status(400).json({ error: 'Amenities list is empty' });
    }
  }
  db.run(
    'INSERT INTO rooms (name, room_type, capacity, floor, description, amenities) VALUES (?, ?, ?, ?, ?, ?)',
    [
      name.trim(),
      roomType.trim(),
      trimmedCapacity,
      optional(floor),
      optional(description),
      trimmedAmenities,
    ],
    function (err) {
      if (err) {
        if (String(err.message).includes('UNIQUE')) {
          return res.status(409).json({ error: 'A room with this name already exists' });
        }
        return res.status(500).json({ error: 'Failed to create room' });
      }
      res.status(201).json({
        id: this.lastID,
        name: name.trim(),
        roomType: roomType.trim(),
        capacity: trimmedCapacity,
        floor: optional(floor),
        description: optional(description),
        amenities: trimmedAmenities,
      });
    }
  );
});

router.post('/:id/book', (req, res) => {
  const roomId = Number(req.params.id);
  if (!Number.isInteger(roomId) || roomId <= 0) {
    return res.status(400).json({ error: 'Invalid room id' });
  }
  db.get('SELECT id FROM rooms WHERE id = ?', [roomId], (err, room) => {
    if (err) return res.status(500).json({ error: 'Failed to load room' });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    db.run(
      'INSERT INTO bookings (room_id, user_id) VALUES (?, ?)',
      [roomId, req.user.id],
      function (err) {
        if (err) {
          if (String(err.message).includes('UNIQUE')) {
            return res.status(409).json({ error: 'Room is already booked' });
          }
          return res.status(500).json({ error: 'Failed to book room' });
        }
        res.status(201).json({ roomId, bookedBy: req.user.username });
      }
    );
  });
});

router.delete('/:id/book', (req, res) => {
  const roomId = Number(req.params.id);
  if (!Number.isInteger(roomId) || roomId <= 0) {
    return res.status(400).json({ error: 'Invalid room id' });
  }
  db.get(
    'SELECT user_id FROM bookings WHERE room_id = ?',
    [roomId],
    (err, booking) => {
      if (err) return res.status(500).json({ error: 'Failed to load booking' });
      if (!booking) return res.status(404).json({ error: 'Room is not booked' });
      if (booking.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the person who booked this room can cancel it' });
      }
      db.run('DELETE FROM bookings WHERE room_id = ? AND user_id = ?', [roomId, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to cancel booking' });
        res.status(204).end();
      });
    }
  );
});

export default router;
