const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Document = require('../src/models/Document');
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

describe('document access control', () => {
  test('a user with no relationship to a document gets 403 on GET and PATCH', async () => {
    const owner = await createUser('owner@example.com');
    const stranger = await createUser('stranger@example.com');
    const doc = await Document.create({ title: 'Private doc', owner: owner._id });

    const strangerToken = await loginToken('stranger@example.com');

    const getRes = await request(app)
      .get(`/documents/${doc._id}`)
      .set('Authorization', `Bearer ${strangerToken}`);
    expect(getRes.status).toBe(403);

    const patchRes = await request(app)
      .patch(`/documents/${doc._id}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ title: 'Hacked' });
    expect(patchRes.status).toBe(403);
  });

  test('a shared viewer can read but not edit', async () => {
    const owner = await createUser('owner2@example.com');
    const viewer = await createUser('viewer@example.com');
    const doc = await Document.create({
      title: 'Shared doc',
      owner: owner._id,
      sharedWith: [{ user: viewer._id, role: 'viewer' }],
    });

    const viewerToken = await loginToken('viewer@example.com');

    const getRes = await request(app)
      .get(`/documents/${doc._id}`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe('Shared doc');

    const patchRes = await request(app)
      .patch(`/documents/${doc._id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Edited by viewer' });
    expect(patchRes.status).toBe(403);
  });

  test('the owner can edit their own document', async () => {
    const owner = await createUser('owner3@example.com');
    const doc = await Document.create({ title: 'Owned doc', owner: owner._id });

    const ownerToken = await loginToken('owner3@example.com');

    const patchRes = await request(app)
      .patch(`/documents/${doc._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Edited by owner' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.title).toBe('Edited by owner');
  });

  test('a shared editor can edit the document', async () => {
    const owner = await createUser('owner4@example.com');
    const editor = await createUser('editor@example.com');
    const doc = await Document.create({
      title: 'Editable doc',
      owner: owner._id,
      sharedWith: [{ user: editor._id, role: 'editor' }],
    });

    const editorToken = await loginToken('editor@example.com');

    const patchRes = await request(app)
      .patch(`/documents/${doc._id}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ title: 'Edited by editor' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.title).toBe('Edited by editor');
  });

  test('a malformed document id returns 404 instead of crashing', async () => {
    const owner = await createUser('owner6@example.com');
    const ownerToken = await loginToken('owner6@example.com');

    const res = await request(app)
      .get('/documents/not-a-valid-id')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  test('only the owner can share a document', async () => {
    const owner = await createUser('owner5@example.com');
    const editor = await createUser('editor2@example.com');
    const outsider = await createUser('outsider@example.com');
    const doc = await Document.create({
      title: 'Doc to share',
      owner: owner._id,
      sharedWith: [{ user: editor._id, role: 'editor' }],
    });

    const editorToken = await loginToken('editor2@example.com');

    const shareRes = await request(app)
      .post(`/documents/${doc._id}/share`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ email: 'outsider@example.com', role: 'viewer' });

    expect(shareRes.status).toBe(403);
  });
});
