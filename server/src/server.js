require('dotenv').config();
const { createApp } = require('./app');
const { connectDB } = require('./db');

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const app = createApp();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
