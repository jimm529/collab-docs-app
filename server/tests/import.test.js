const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const { startTestDB, stopTestDB, clearTestDB } = require('./setup');

const app = createApp();

async function createUser(email) {
  const passwordHash = await bcrypt.hash('password123', 4);
  return User.create({ name: email.split('@')[0], email, passwordHash });
}

async function loginToken(email) {
  const res = await request(app).post('/auth/login').send({ email, password: 'password123' });
  return res.body.token;
}

beforeAll(startTestDB);
afterAll(stopTestDB);
afterEach(clearTestDB);

describe('document import', () => {
  test('creates a document from an uploaded .txt file', async () => {
    await createUser('importer@example.com');
    const token = await loginToken('importer@example.com');

    const res = await request(app)
      .post('/documents/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('Line one\nLine two'), 'notes.txt');

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('notes');
    expect(res.body.content.content).toHaveLength(2);
    expect(res.body.content.content[0].content[0].text).toBe('Line one');
  });

  test('rejects an unsupported file type', async () => {
    await createUser('importer2@example.com');
    const token = await loginToken('importer2@example.com');

    const res = await request(app)
      .post('/documents/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('binary stuff'), 'virus.exe');

    expect(res.status).toBe(400);
  });

  test('rejects a request with no file', async () => {
    await createUser('importer3@example.com');
    const token = await loginToken('importer3@example.com');

    const res = await request(app).post('/documents/import').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
