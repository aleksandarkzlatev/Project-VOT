const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const jwt = require('jsonwebtoken');
const mariadb = require('mariadb');
require('dotenv').config();

const app = express();
const port = 3000;

// Database connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

// Keycloak setup
const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
}));

app.use(keycloak.middleware());

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Keycloak public key for JWT verification
const publicKey = process.env.KEYCLOAK_PUBLIC_KEY;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    req.user = decoded;
    next();
  });
};

// Routes
app.post('/messages', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.sub;

    const conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO messages (content, userId) VALUES (?, ?)",
      [content, userId]
    );
    conn.release();

    res.status(201).json({ id: result.insertId, content, userId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/messages', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT m.id, m.content, u.username FROM messages m JOIN users u ON m.userId = u.id"
    );
    conn.release();

    res.json(rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync database and start server
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        userId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
    conn.release();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
