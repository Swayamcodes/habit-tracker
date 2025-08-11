import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Function to handle the logout logic
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the JWT from local storage
    setIsLoggedIn(false); // Update the state to logged out
    navigate('/login'); // Redirect to the login page
  };

  // Function to handle successful login
  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // The empty array ensures this runs only once on mount

  return (
    <div className="App">
      <Routes>
        {isLoggedIn ? (
          // Protected routes for a logged-in user
          <Route path="/" element={<Dashboard handleLogout={handleLogout} />} />
        ) : (
          // Public routes for a non-logged-in user
          <>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            {/* Catch-all route to redirect to login */}
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;
