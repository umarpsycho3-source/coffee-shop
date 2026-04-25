require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Stripe - Key is now securely stored in .env file
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize SQLite Database
const db = new Database('database.sqlite');

// Setup Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer'
  );
  
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    customerName TEXT NOT NULL,
    whatsapp TEXT,
    orderType TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    address TEXT,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'Preparing',
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    whatsapp TEXT,
    notes TEXT
  );
`);

// Create default admin user if not exists
const defaultAdminEmail = 'admin@admin.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(defaultAdminEmail);
if (!existingAdmin) {
  const hash = bcrypt.hashSync('password', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', defaultAdminEmail, hash, 'admin');
}

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_super_secret_jwt_key_for_coffee_shop'; // Use env variable in prod

// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const role = email.toLowerCase() === defaultAdminEmail ? 'admin' : 'customer';
    
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, hash, role);
    
    const user = { id: info.lastInsertRowid, name, email, role };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ user, token });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const userWithoutPassword = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(userWithoutPassword, JWT_SECRET);
  res.json({ user: userWithoutPassword, token });
});

// --- STRIPE ENDPOINT ---
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { totalAmount, orderItems } = req.body;
    const amountInCents = Math.round(totalAmount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORDERS ENDPOINTS ---
app.post('/api/orders', (req, res) => {
  const { userId, customerName, whatsapp, orderType, paymentMethod, address, items, total, date, status } = req.body;
  const stmt = db.prepare(`
    INSERT INTO orders (userId, customerName, whatsapp, orderType, paymentMethod, address, items, total, date, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(userId, customerName, whatsapp, orderType, paymentMethod, address, JSON.stringify(items), total, date, status || 'Preparing');
  res.json({ id: info.lastInsertRowid });
});

app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY date DESC').all();
  // Parse items back from string
  orders.forEach(o => o.items = JSON.parse(o.items));
  res.json(orders);
});

app.get('/api/orders/user/:email', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY date DESC').all(req.params.email);
  orders.forEach(o => o.items = JSON.parse(o.items));
  res.json(orders);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// --- BOOKINGS ENDPOINTS ---
app.post('/api/bookings', (req, res) => {
  const { userId, name, date, time, guests, whatsapp, notes } = req.body;
  const stmt = db.prepare(`
    INSERT INTO bookings (userId, name, date, time, guests, whatsapp, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(userId, name, date, time, guests, whatsapp, notes);
  res.json({ id: info.lastInsertRowid });
});

app.get('/api/bookings', (req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY date ASC').all();
  res.json(bookings);
});

app.get('/api/bookings/user/:email', (req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings WHERE userId = ? ORDER BY date ASC').all(req.params.email);
  res.json(bookings);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Real Database Backend running on http://localhost:${PORT}`);
});
