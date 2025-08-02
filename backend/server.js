
import express from 'express';
import 'dotenv/config'; 
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json()); 
app.use(cors()); 

const port = 3000;
const saltRounds = 10; 


const db = new pg.Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});


async function connectionToDatabase() {
  try {
    await db.connect();
    console.log('Connected to the database successfully!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); 
  }
}

connectionToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});


app.get(`/`, (req, res) => {
  res.send(`Hello, World! This is your habit tracker backend.`);
});


app.post(`/api/register`, async (req, res) => {
  const { username, password } = req.body;

  try {
   
    const hashedPassword = await bcrypt.hash(password, saltRounds);

 
    const queryText = 'INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING *';
    const values = [username, hashedPassword];
    const result = await db.query(queryText, values);

  
    res.status(201).json({ 
      message: 'User registered successfully!', 
      user: result.rows[0] 
    });

  } catch (error) {
    
    if (error.code === '23505') { 
      return res.status(409).json({ message: 'Username already exists.' });
    }
    
    console.error('Error during registration:', error.message);
    
    res.status(500).json({ message: 'Error during registration. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find the user in the database based on the username
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    // Check if a user with that username exists
    if (result.rows.length === 0) {
      // If no user is found, send an unauthorized response
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const storedHash = user.password_hash; // This is the hash from the database

    // 2. Compare the submitted password with the hashed password from the database
    const match = await bcrypt.compare(password, storedHash);

    if (match) {
      // If the passwords match, send a success message.
      const secretKey = process.env.JWT_SECRET;
      const token = jwt.sign({
        username: user.username,
        id: user.id,
      }, secretKey, { expiresIn: '1h' });
     res.status(200).json({ message: 'Login successful', token: token });
    } else {
      // If the passwords do not match, send an unauthorized response
      res.status(401).json({ message: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Error during login' });
  }
});
