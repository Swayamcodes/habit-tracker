import express from 'express';
import 'dotenv/config'; 
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;
const saltRounds = 10;

// ✅ Use a single connection setup
const db = new pg.Client({
  user: 'tracker_user',
  password: 'tracker123',
  host: 'localhost',
  port: 5432,
  database: 'my_tracker'
});

db.connect()
  .then(() => {
    console.log("✅ Connected to database");
    
    // Start the server only after DB is connected
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const queryText = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *';
    const values = [username, hashedPassword];
    const result = await db.query(queryText, values);

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    res.status(500).json({ message: 'Error during registration' });
  }
});
