import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/users');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '2rem auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
