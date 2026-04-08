const { getDb, runQuery } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  const db = await getDb();

  // Clear existing data
  db.run('DELETE FROM pickups');
  db.run('DELETE FROM donations');
  db.run('DELETE FROM donors');
  db.run('DELETE FROM ngos');

  // Seed donors
  runQuery(
    `INSERT INTO donors (name, contact, phone, address, food_type, password_hash) VALUES (?, ?, ?, ?, ?, ?)`,
    ['Green Garden Restaurant', 'Rajesh Kumar', '9876543210', '42 MG Road, Bangalore', 'Vegetarian Indian', hashPassword('donor123')]
  );

  runQuery(
    `INSERT INTO donors (name, contact, phone, address, food_type, password_hash) VALUES (?, ?, ?, ?, ?, ?)`,
    ['The Daily Bread Café', 'Priya Sharma', '9123456780', '15 Park Street, Mumbai', 'Bakery & Pastries', hashPassword('donor123')]
  );

  // Seed NGOs
  runQuery(
    `INSERT INTO ngos (name, contact, phone, password_hash) VALUES (?, ?, ?, ?)`,
    ['Feeding Hope Foundation', 'Anita Desai', '9988776655', hashPassword('ngo123')]
  );

  // Seed donations
  const expiry1 = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
  runQuery(
    `INSERT INTO donations (donor_id, food_name, quantity, expiry_datetime, description, status, safety_temp, safety_packaging, safety_allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 'Paneer Biryani', '20 servings', expiry1, 'Freshly prepared paneer biryani with raita. Suitable for vegetarians.', 'available', 'hot', 'sealed', 'no']
  );

  const expiry2 = new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString();
  runQuery(
    `INSERT INTO donations (donor_id, food_name, quantity, expiry_datetime, description, status, safety_temp, safety_packaging, safety_allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 'Mixed Vegetable Curry', '15 servings', expiry2, 'Mixed veg curry with seasonal vegetables. Contains no nuts.', 'available', 'hot', 'sealed', 'no']
  );

  const expiry3 = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  runQuery(
    `INSERT INTO donations (donor_id, food_name, quantity, expiry_datetime, description, status, safety_temp, safety_packaging, safety_allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [2, 'Assorted Pastries', '30 pieces', expiry3, "Croissants, muffins, and Danish pastries from today's batch.", 'available', 'dry', 'sealed', 'yes']
  );

  console.log('✅ Database seeded successfully!');
  console.log('   Donors: Green Garden Restaurant (phone: 9876543210, pass: donor123)');
  console.log('           The Daily Bread Café (phone: 9123456780, pass: donor123)');
  console.log('   NGO:    Feeding Hope Foundation (phone: 9988776655, pass: ngo123)');
  console.log('   Donations: 3 sample donations created');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
