import { useState } from "react"
import React from 'react'




const Register = () => {

const [username, setUsername] = useState(' ');
const [password, setPassword] = useState(' ');

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch ('http://localhost:3001/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json(); //Parse the JSON response

        if (response.ok) {
            console.log('Registration successful:', data.message);
            
        } else {
            console.error('Registration failed:', data.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        }
}


  return (
    <div>
        <h2>Register</h2>
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
        <button type="submit">Register</button>
    </form>
    </div>
  )
}

export default Register

