import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Rooms from './pages/Rooms.jsx';
import MyBookings from './pages/MyBookings.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Room Booking</div>
        {isAuthenticated && (
          <nav className="nav">
            <Link to="/rooms">Rooms</Link>
            <Link to="/bookings">My Bookings</Link>
            <span className="nav-user">{user?.username}</span>
            <button className="btn btn-outline" onClick={logout}>
              Log out
            </button>
          </nav>
        )}
      </header>
      <main className="content">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/rooms" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/rooms" replace /> : <Register />} />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <Rooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/rooms' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}
