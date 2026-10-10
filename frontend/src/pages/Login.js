import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    // VULN: Storing password in localStorage
    localStorage.setItem('lastPassword', password);
    localStorage.setItem('userEmail', email);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('authToken', response.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      // VULN: Exposing error details to user
      alert('Login failed: ' + JSON.stringify(err.response?.data));
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
