require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./db');
const User = require('./models/User');

const SEED_USERS = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Carol', email: 'carol@example.com' },
];

async function seed() {
  const password = process.env.SEED_PASSWORD || 'password123';
  await connectDB(process.env.MONGO_URI);

  for (const { name, email } of SEED_USERS) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email },
      { name, email, passwordHash },
      { upsert: true, new: true }
    );
    console.log(`Seeded user: ${email}`);
  }

  console.log(`\nAll seeded users share the password: "${password}"`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
