const TOKEN_KEY = 'jwt';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(path, { ...options, headers });
  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    setToken(null);
    window.location.assign('/login');
  }
  if (response.status === 204) {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getRooms: () => request('/api/rooms'),
  createRoom: (body) => request('/api/rooms', { method: 'POST', body: JSON.stringify(body) }),
  bookRoom: (roomId) => request(`/api/rooms/${roomId}/book`, { method: 'POST', body: JSON.stringify({}) }),
  cancelBooking: (roomId) => request(`/api/rooms/${roomId}/book`, { method: 'DELETE' }),
  getMyBookings: () => request('/api/bookings/me'),
};
