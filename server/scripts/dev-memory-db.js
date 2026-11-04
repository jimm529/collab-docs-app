// Local-only helper: boots an in-memory MongoDB for manual testing without
// an Atlas account. Not used in production or in the automated tests.
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create({ instance: { port: 27117 } });
  console.log('MONGO_URI=' + mongod.getUri());
})();
