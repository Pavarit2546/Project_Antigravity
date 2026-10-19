import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ username, password });
      navigate('/rooms');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Create account</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
