const express = require('express');
const session = require('express-session');
const cors = require('cors');
const crypto = require('crypto');
const { getDb, queryAll, queryOne, runQuery } = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(session({
  secret: 'food-waste-redistribution-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Auto-expire donations past their expiry time
function autoExpireDonations() {
  const now = new Date().toISOString();
  try {
    runQuery(`UPDATE donations SET status = 'expired' WHERE status = 'available' AND expiry_datetime < ?`, [now]);
  } catch (e) {
    // ignore if db not ready yet
  }
}

// ─── Auth Middleware ───────────────────────────────────────
function requireDonor(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'donor') {
    return res.status(401).json({ error: 'Unauthorized. Donor login required.' });
  }
  next();
}

function requireNGO(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'ngo') {
    return res.status(401).json({ error: 'Unauthorized. NGO login required.' });
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
}

// ─── Auth Routes ───────────────────────────────────────────

// Register donor
app.post('/api/auth/register/donor', (req, res) => {
  try {
    const { name, contact, phone, address, food_type, password } = req.body;
    if (!name || !contact || !phone || !address || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = queryOne('SELECT id FROM donors WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(409).json({ error: 'A donor with this phone number already exists.' });
    }

    const result = runQuery(
      `INSERT INTO donors (name, contact, phone, address, food_type, password_hash) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, contact, phone, address, food_type || '', hashPassword(password)]
    );

    req.session.user = { id: result.lastInsertRowid, role: 'donor', name };
    res.status(201).json({ message: 'Donor registered successfully', user: req.session.user });
  } catch (err) {
    console.error('Register donor error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Register NGO
app.post('/api/auth/register/ngo', (req, res) => {
  try {
    const { name, contact, phone, password } = req.body;
    if (!name || !contact || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = queryOne('SELECT id FROM ngos WHERE phone = ?', [phone]);
    if (existing) {
      return res.status(409).json({ error: 'An NGO with this phone number already exists.' });
    }

    const result = runQuery(
      `INSERT INTO ngos (name, contact, phone, password_hash) VALUES (?, ?, ?, ?)`,
      [name, contact, phone, hashPassword(password)]
    );

    req.session.user = { id: result.lastInsertRowid, role: 'ngo', name };
    res.status(201).json({ message: 'NGO registered successfully', user: req.session.user });
  } catch (err) {
    console.error('Register NGO error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password, role } = req.body;
    if (!phone || !password || !role) {
      return res.status(400).json({ error: 'Phone, password, and role are required.' });
    }

    const hash = hashPassword(password);
    let user;

    if (role === 'donor') {
      user = queryOne('SELECT id, name FROM donors WHERE phone = ? AND password_hash = ?', [phone, hash]);
    } else if (role === 'ngo') {
      user = queryOne('SELECT id, name FROM ngos WHERE phone = ? AND password_hash = ?', [phone, hash]);
    } else {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password.' });
    }

    req.session.user = { id: user.id, role, name: user.name };
    res.json({ message: 'Logged in successfully', user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// ─── Donation Routes ───────────────────────────────────────

// Create donation (donor only)
app.post('/api/donations', requireDonor, (req, res) => {
  try {
    const { food_name, quantity, expiry_datetime, description, safety_temp, safety_packaging, safety_allergens } = req.body;
    if (!food_name || !quantity || !expiry_datetime) {
      return res.status(400).json({ error: 'Food name, quantity, and expiry date/time are required.' });
    }

    const result = runQuery(
      `INSERT INTO donations (donor_id, food_name, quantity, expiry_datetime, description, status, safety_temp, safety_packaging, safety_allergens) VALUES (?, ?, ?, ?, ?, 'available', ?, ?, ?)`,
      [req.session.user.id, food_name, quantity, expiry_datetime, description || '', safety_temp || 'dry', safety_packaging || 'sealed', safety_allergens || 'no']
    );

    const donation = queryOne('SELECT * FROM donations WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(donation);
  } catch (err) {
    console.error('Create donation error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get all available donations (for NGO browsing)
app.get('/api/donations/available', (req, res) => {
  try {
    autoExpireDonations();
    const donations = queryAll(`
      SELECT d.*, dn.name as donor_name, dn.address as donor_address, dn.phone as donor_phone
      FROM donations d
      JOIN donors dn ON d.donor_id = dn.id
      WHERE d.status = 'available'
      ORDER BY d.expiry_datetime ASC
    `);
    res.json(donations);
  } catch (err) {
    console.error('Get available donations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get donor's donations
app.get('/api/donations/mine', requireDonor, (req, res) => {
  try {
    autoExpireDonations();
    const donations = queryAll(`
      SELECT d.*, 
        p.scheduled_time, p.status as pickup_status, p.ngo_id,
        n.name as ngo_name, n.phone as ngo_phone
      FROM donations d
      LEFT JOIN pickups p ON d.id = p.donation_id
      LEFT JOIN ngos n ON p.ngo_id = n.id
      WHERE d.donor_id = ?
      ORDER BY d.created_at DESC
    `, [req.session.user.id]);
    res.json(donations);
  } catch (err) {
    console.error('Get my donations error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update donation status
app.patch('/api/donations/:id/status', requireAuth, (req, res) => {
  try {
    const { status } = req.body;
    const id = parseInt(req.params.id);
    const donation = queryOne('SELECT * FROM donations WHERE id = ?', [id]);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found.' });
    }

    runQuery('UPDATE donations SET status = ? WHERE id = ?', [status, id]);
    const updated = queryOne('SELECT * FROM donations WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Update donation status error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Pickup Routes ─────────────────────────────────────────

// Accept donation and schedule pickup (NGO only)
app.post('/api/pickups', requireNGO, (req, res) => {
  try {
    const { donation_id, scheduled_time } = req.body;
    if (!donation_id || !scheduled_time) {
      return res.status(400).json({ error: 'Donation ID and scheduled time are required.' });
    }

    const donation = queryOne('SELECT * FROM donations WHERE id = ? AND status = ?', [donation_id, 'available']);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found or no longer available.' });
    }

    // Update donation status
    runQuery('UPDATE donations SET status = ? WHERE id = ?', ['accepted', donation_id]);

    // Create pickup
    const result = runQuery(
      `INSERT INTO pickups (donation_id, ngo_id, scheduled_time, status) VALUES (?, ?, ?, 'scheduled')`,
      [donation_id, req.session.user.id, scheduled_time]
    );

    const pickup = queryOne(`
      SELECT p.*, d.food_name, d.quantity, d.expiry_datetime, d.description,
        d.safety_temp, d.safety_packaging, d.safety_allergens,
        dn.name as donor_name, dn.address as donor_address, dn.phone as donor_phone
      FROM pickups p
      JOIN donations d ON p.donation_id = d.id
      JOIN donors dn ON d.donor_id = dn.id
      WHERE p.id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(pickup);
  } catch (err) {
    console.error('Create pickup error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get NGO's scheduled pickups
app.get('/api/pickups/mine', requireNGO, (req, res) => {
  try {
    const pickups = queryAll(`
      SELECT p.*, d.food_name, d.quantity, d.expiry_datetime, d.description, d.status as donation_status,
        d.safety_temp, d.safety_packaging, d.safety_allergens,
        dn.name as donor_name, dn.address as donor_address, dn.phone as donor_phone
      FROM pickups p
      JOIN donations d ON p.donation_id = d.id
      JOIN donors dn ON d.donor_id = dn.id
      WHERE p.ngo_id = ?
      ORDER BY p.scheduled_time ASC
    `, [req.session.user.id]);
    res.json(pickups);
  } catch (err) {
    console.error('Get my pickups error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update pickup status
app.patch('/api/pickups/:id/status', requireAuth, (req, res) => {
  try {
    const { status } = req.body;
    const id = parseInt(req.params.id);
    const pickup = queryOne('SELECT * FROM pickups WHERE id = ?', [id]);

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found.' });
    }

    runQuery('UPDATE pickups SET status = ? WHERE id = ?', [status, id]);

    // Also update the donation status accordingly
    if (status === 'picked_up') {
      runQuery('UPDATE donations SET status = ? WHERE id = ?', ['picked_up', pickup.donation_id]);
    } else if (status === 'completed') {
      runQuery('UPDATE donations SET status = ? WHERE id = ?', ['completed', pickup.donation_id]);
    }

    const updated = queryOne(`
      SELECT p.*, d.food_name, d.quantity, d.expiry_datetime, d.description, d.status as donation_status,
        d.safety_temp, d.safety_packaging, d.safety_allergens,
        dn.name as donor_name, dn.address as donor_address, dn.phone as donor_phone
      FROM pickups p
      JOIN donations d ON p.donation_id = d.id
      JOIN donors dn ON d.donor_id = dn.id
      WHERE p.id = ?
    `, [id]);

    res.json(updated);
  } catch (err) {
    console.error('Update pickup status error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Start Server ──────────────────────────────────────────
async function start() {
  await getDb();
  console.log('📦 Database initialized');

  // Run auto-expire every minute
  if (process.env.NODE_ENV !== 'production') {
    setInterval(autoExpireDonations, 60 * 1000);
  }
  autoExpireDonations();

  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }
}

start().catch(err => {
  console.error('Failed to start server:', err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

module.exports = app;
