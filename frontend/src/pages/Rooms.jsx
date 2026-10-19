import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function amenitiesList(room) {
  if (!room.amenities) return [];
  return room.amenities.split(',').map((a) => a.trim()).filter(Boolean);
}

export default function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState('meeting');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomAmenities, setNewRoomAmenities] = useState('');

  const loadRooms = useCallback(async () => {
    try {
      const data = await api.getRooms();
      setRooms(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const handleBook = async (roomId) => {
    try {
      await api.bookRoom(roomId);
      flash('Room booked');
      await loadRooms();
    } catch (err) {
      flash(err.message);
    }
  };

  const handleCancel = async (roomId) => {
    try {
      await api.cancelBooking(roomId);
      flash('Booking cancelled');
      await loadRooms();
    } catch (err) {
      flash(err.message);
    }
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    try {
      await api.createRoom({
        name: newRoomName,
        roomType: newRoomType,
        capacity: newRoomCapacity,
        floor: newRoomFloor,
        description: newRoomDescription,
        amenities: newRoomAmenities,
      });
      setNewRoomName('');
      setNewRoomCapacity('');
      setNewRoomFloor('');
      setNewRoomDescription('');
      setNewRoomAmenities('');
      flash('Room added');
      await loadRooms();
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>Rooms</h1>
        <div className="legend">
          <span className="pill pill-free">Free</span>
          <span className="pill pill-booked">Booked</span>
        </div>
      </div>
      {(error || notice) && <p className="banner">{error || notice}</p>}
      <div className="room-grid">
        {rooms.map((room) => (
          <article key={room.id} className={`room-card ${room.status}`}>
            <div className="room-title">
              <h2>{room.name}</h2>
              <span className="pill">{room.status}</span>
            </div>
            <p className="room-type">{room.roomType}</p>
            <ul className="room-details">
              {room.capacity != null && (
                <li className="room-detail">
                  <span className="room-detail-label">Seats</span>
                  <span>{room.capacity}</span>
                </li>
              )}
              {room.floor != null && (
                <li className="room-detail">
                  <span className="room-detail-label">Floor</span>
                  <span>{room.floor}</span>
                </li>
              )}
            </ul>
            {room.description && <p className="room-description">{room.description}</p>}
            {amenitiesList(room).length > 0 && (
              <div className="room-amenities">
                {amenitiesList(room).map((amenity) => (
                  <span className="pill pill-amenity" key={amenity}>
                    {amenity}
                  </span>
                ))}
              </div>
            )}
            {room.status === 'booked' ? (
              <p className="room-holder">Booked by {room.bookedBy}</p>
            ) : (
              <p className="room-holder">Available now</p>
            )}
            <div className="room-actions">
              {room.status === 'free' ? (
                <button className="btn btn-primary" onClick={() => handleBook(room.id)}>
                  Book
                </button>
              ) : room.userId === user.id ? (
                <button className="btn btn-danger" onClick={() => handleCancel(room.id)}>
                  Cancel my booking
                </button>
              ) : (
                <button className="btn" disabled>
                  Taken
                </button>
              )}
            </div>
          </article>
        ))}
        {rooms.length === 0 && <p>No rooms yet — add one below.</p>}
      </div>
      <form className="add-room" onSubmit={handleCreateRoom}>
        <h2>Add a room</h2>
        <input
          placeholder="Room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          required
        />
        <input
          placeholder="Capacity"
          type="number"
          min="1"
          value={newRoomCapacity}
          onChange={(e) => setNewRoomCapacity(e.target.value)}
        />
        <input
          placeholder="Floor"
          value={newRoomFloor}
          onChange={(e) => setNewRoomFloor(e.target.value)}
        />
        <input
          placeholder="Amenities (comma separated)"
          value={newRoomAmenities}
          onChange={(e) => setNewRoomAmenities(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="add-room-desc"
          value={newRoomDescription}
          onChange={(e) => setNewRoomDescription(e.target.value)}
          rows={2}
        />
        <select value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)}>
          <option value="meeting">meeting</option>
          <option value="lounge">lounge</option>
          <option value="phone-booth">phone-booth</option>
        </select>
        <button className="btn btn-primary" type="submit">
          Add room
        </button>
      </form>
    </div>
  );
}
