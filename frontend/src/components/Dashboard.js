import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ handleLogout }) {
  const [habits, setHabits] = useState([]);
  const [habitName, setHabitName] = useState(''); // State for the habit name input
  const [habitDescription, setHabitDescription] = useState(''); // State for the habit description input
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHabits = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("No token found. User is not authenticated.");
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/habits', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHabits(data.habits);
          console.log("Habits fetched successfully:", data.habits);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch habits:", errorData.message);
          if (response.status === 401) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error("Network error while fetching habits:", error);
      }
    };

    fetchHabits();
  }, [handleLogout, navigate]); // Add handleLogout and navigate to dependencies

  // Function to handle the form submission for creating a new habit
  const handleCreateHabit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found. User is not authenticated.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: habitName, description: habitDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Habit created successfully:", data.habit);
        // Clear the form and add the new habit to the list
        setHabitName('');
        setHabitDescription('');
        setHabits([...habits, data.habit]);
      } else {
        const errorData = await response.json();
        console.error("Failed to create habit:", errorData.message);
      }
    } catch (error) {
      console.error("Network error while creating habit:", error);
    }
  };

  return (
    <div>
      <h2>Your Habits</h2>
      <button onClick={handleLogout}>
        Logout
      </button>

      {habits.length > 0 ? (
        <ul>
          {habits.map(habit => (
            <li key={habit.id}>
              <h3>{habit.name}</h3>
              <p>{habit.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You don't have any habits yet. Start by creating one!</p>
      )}

      <h3>Create a New Habit</h3>
      <form onSubmit={handleCreateHabit}>
        <div>
          <label htmlFor="habit-name">Habit Name:</label>
          <input
            type="text"
            id="habit-name"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="habit-description">Description:</label>
          <textarea
            id="habit-description"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">Add Habit</button>
      </form>
    </div>
  );
}

export default Dashboard;
