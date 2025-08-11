import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// The onLogin function is passed as a prop from the parent App component
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted with:', { username, password });
    try {
      // Corrected: The backend is on port 3000
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data.message);
        
        // This is the crucial step: store the token in local storage
        localStorage.setItem('token', data.token);

        // Call the onLogin prop function to update the parent App's state
        onLogin();
        
        // Navigate the user to the dashboard
        navigate('/');
      } else {
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      console.error('Network error or unexpected issue:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
