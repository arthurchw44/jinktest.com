// import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>404 - Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <button onClick={() => navigate('/')}>Go to Home</button>
      <button style={{ marginLeft: '1rem' }} onClick={() => navigate('/login')}>
        Go to Login
      </button>
    </div>
  );
}
