import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // FIX: Never store password in localStorage
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      sessionStorage.setItem('authToken', response.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      // FIX: Don't expose error details
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
