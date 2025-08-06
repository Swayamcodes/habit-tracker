import React from 'react'
import { useState } from "react"

const Login = () => {

const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch ('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json(); //Parse the JSON response

        if (response.ok) {
            console.log('Login successful:', data.message);
            
        } else {
            console.error('Login failed:', data.message);
        }
    } catch (error) {
        console.error('Error during Login:', error);
        }
}
  return (
    <div>
        <h2>Login</h2>
    <form onSubmit={handleSubmit}>
        <div>
        <label  htmlFor="username">Username:</label>
        <input 
            type ="text"
            id = "username"
            value = {username}
            onChange={(e) => setUsername(e.target.value)}
        />
        </div>
        <div>
        <label  htmlFor="password">Password:</label>
        <input 
            type ="password"
            id = "password"
            value = {password}
            onChange={(e) => setPassword(e.target.value)}
        />
        </div>
        <button type="submit">Login</button>
    </form>
    </div>
  )
}

export default Login