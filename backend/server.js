import express from 'express';
import 'dotenv/config';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

const port = 3001;
const saltRounds = 10;


const jwtSecret = process.env.JWT_SECRET;

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

// --- JWT Authentication Middleware (Defined here, BEFORE the routes) ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decodedPayload = jwt.verify(token, jwtSecret); // Use a consistent variable name
    req.userId = decodedPayload.id;
    next(); // This is the crucial line!
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
// ---------------------------------------------------------------------

app.get('/', (req, res) => {
  res.send('Hello, World! This is your habit tracker backend.');
});

// --- ROUTES (Now using the verifyToken middleware) ---

app.post('/api/register', async (req, res) => {
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
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const user = result.rows[0];
    const storedHash = user.password_hash;
    const match = await bcrypt.compare(password, storedHash);
    if (match) {
      const token = jwt.sign({ username: user.username, id: user.id }, jwtSecret, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token: token });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Now, add the middleware to the protected routes
app.post('/api/habits', verifyToken, async (req, res) => {
  const { name, description } = req.body;
  const userId = req.userId; // Get the user ID from the middleware

  try {
    const queryText = 'INSERT INTO habits(user_id, name, description) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, name, description];
    const result = await db.query(queryText, values);

    res.status(201).json({
      message : 'Habit created successfully',
      habit: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating habit:', error.message);
    res.status(500).json({ message: 'Error creating habit. Please try again' });
  }
});

app.get('/api/habits', verifyToken, async (req, res) => {
  const userId = req.userId; // Get the user ID from the middleware

  try {
    const queryText = 'SELECT * FROM habits WHERE user_id = $1 ORDER BY id DESC';
    const values = [userId];
    const result = await db.query(queryText, values);

    res.status(200).json({
      message: 'Habits retrieved successfully',
      habits: result.rows
    });
  } catch (error) {
    console.error('Error retrieving habits:', error.message);
    res.status(500).json({
      message: 'Error retrieving habits. Please try again'
    });
  }
});

app.post('/api/habits/:id/complete', verifyToken, async (req, res) => {
  const habitId = req.params.id;
  const userId = req.userId;

  try {
    const habitCheckQuery = 'SELECT * FROM habits WHERE id = $1 AND user_id = $2';
    const habitCheckValues = [habitId, userId];
    const habitCheckResult = await db.query(habitCheckQuery, habitCheckValues);

    if (habitCheckResult.rows.length === 0) {
      return res.status(404).json({ message: 'Habit not found or does not belong to user.' });
    }

    const insertQuery = 'INSERT INTO completions (habit_id, completed_date) VALUES ($1, NOW()) RETURNING *';
    const insertValues = [habitId];
    const completionResult = await db.query(insertQuery, insertValues);

    res.status(201).json({
      message: 'Habit marked as complete successfully.',
      completion: completionResult.rows[0]
    });
  } catch (error) {
    console.error('Error marking habit as complete:', error.message);
    res.status(500).json({ message: 'Error marking habit as complete. Please try again.' });
  }
});

