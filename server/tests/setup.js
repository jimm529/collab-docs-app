const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

async function startTestDB() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

async function stopTestDB() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

async function clearTestDB() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

module.exports = { startTestDB, stopTestDB, clearTestDB };
