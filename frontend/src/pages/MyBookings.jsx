import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async () => {
    try {
      setBookings(await api.getMyBookings());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (roomId) => {
    try {
      await api.cancelBooking(roomId);
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>My bookings</h1>
      {error && <p className="banner">{error}</p>}
      {bookings.length === 0 ? (
        <p>You have no active bookings.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <li key={booking.id} className="booking-row">
              <div>
                <strong>{booking.roomName}</strong>
                <span className="room-type"> {booking.roomType}</span>
                <div className="booking-details">
                  {booking.capacity != null && <span>Seats {booking.capacity}</span>}
                  {booking.floor != null && <span>Floor {booking.floor}</span>}
                  {booking.description && <span className="booking-desc">{booking.description}</span>}
                </div>
              </div>
              <div className="booking-meta">
                <span>Booked {booking.bookedAt}</span>
                <button className="btn btn-danger" onClick={() => handleCancel(booking.roomId)}>
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
