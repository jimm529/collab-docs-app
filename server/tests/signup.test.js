const request = require('supertest');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const { startTestDB, stopTestDB, clearTestDB } = require('./setup');

const app = createApp();

beforeAll(startTestDB);
afterAll(stopTestDB);
afterEach(clearTestDB);

describe('signup', () => {
  test('creates a new account and returns a usable token', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Dana', email: 'dana@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('dana@example.com');

    const docsRes = await request(app).get('/documents').set('Authorization', `Bearer ${res.body.token}`);
    expect(docsRes.status).toBe(200);
  });

  test('rejects a duplicate email', async () => {
    await User.create({ name: 'Dana', email: 'dana2@example.com', passwordHash: 'x' });

    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Dana Two', email: 'dana2@example.com', password: 'password123' });

    expect(res.status).toBe(400);
  });

  test('rejects a short password', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Dana', email: 'dana3@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  test('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ name: 'Dana', email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  test('rejects a missing name', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ email: 'dana4@example.com', password: 'password123' });

    expect(res.status).toBe(400);
  });
});
