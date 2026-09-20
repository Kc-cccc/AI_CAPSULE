import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../../src/http/createApp.js';
import { createDatabase } from '../../src/infrastructure/sqlite/capsuleRepository.js';

const testConfig = {
  nodeEnv: 'test',
  jwtSecret: 'test-only-secret-that-is-long-enough',
  dbFile: ':memory:',
  appUrl: 'http://localhost:3000',
  clientUrl: 'http://localhost:5173'
};

function sessionCookie(userId, login) {
  const token = jwt.sign(
    { sub: userId, login, avatar_url: '' },
    testConfig.jwtSecret,
    { expiresIn: '10m', issuer: 'ai-capsule', audience: 'ai-capsule-web' }
  );
  return `token=${token}`;
}

const capsule = {
  project_name: 'SmartFarm Irrigation',
  prompt_title: 'Debug cloud deployment',
  prompt_version: 'v3',
  prompt_text: 'Why does my Node server fail after deployment?',
  response_summary: 'Check the start command and cloud environment variables.',
  category: 'Coding',
  usefulness: 'Good',
  reviewed: true,
  improved: true,
  screenshot_url: 'https://example.com/evidence.png',
  notes: 'Keep the final checks concise.'
};

describe('AI Capsule API', () => {
  let database;
  let app;
  const owner = sessionCookie('101', 'capsule-owner');
  const stranger = sessionCookie('202', 'another-user');

  before(() => {
    database = createDatabase(':memory:');
    app = createApp({ config: testConfig, database });
  });

  after(() => database.close());

  test('GET /api/health is public', async () => {
    const response = await request(app).get('/api/health').expect(200);
    assert.deepEqual(response.body, { status: 'ok' });
  });

  test('development starts without .env while production still requires JWT_SECRET', async () => {
    const developmentDatabase = createDatabase(':memory:');
    const developmentApp = createApp({
      config: { nodeEnv: 'development', dbFile: ':memory:' },
      database: developmentDatabase
    });
    await request(developmentApp).get('/api/health').expect(200, { status: 'ok' });
    const signIn = await request(developmentApp).get('/auth/github').expect(302);
    assert.equal(signIn.headers.location, 'http://localhost:5173/dashboard');
    assert.match(signIn.headers['set-cookie'][0], /^token=/);
    assert.match(signIn.headers['set-cookie'][0], /HttpOnly/);
    const developmentCookie = signIn.headers['set-cookie'][0].split(';')[0];
    const currentUser = await request(developmentApp)
      .get('/api/auth/me')
      .set('Cookie', developmentCookie)
      .expect(200);
    assert.equal(currentUser.body.login, 'local-preview');
    developmentDatabase.close();

    assert.throws(
      () => createApp({ config: { nodeEnv: 'production', jwtSecret: '', dbFile: ':memory:' } }),
      /JWT_SECRET is required/
    );
  });

  test('protected routes reject missing and fake tokens', async () => {
    await request(app).get('/api/capsules').expect(401, { error: 'Unauthorized' });
    await request(app)
      .get('/api/capsules')
      .set('Cookie', 'token=not-a-real-jwt')
      .expect(401, { error: 'Unauthorized' });
  });

  test('CRUD is scoped to the authenticated owner', async () => {
    const created = await request(app)
      .post('/api/capsules')
      .set('Cookie', owner)
      .send({ ...capsule, user_id: 'attempted-browser-override' })
      .expect(201);

    assert.equal(created.body.user_id, '101');
    assert.equal(created.body.prompt_title, capsule.prompt_title);
    assert.equal(created.body.reviewed, true);

    const ownerList = await request(app)
      .get('/api/capsules')
      .set('Cookie', owner)
      .expect(200);
    assert.equal(ownerList.body.length, 1);

    const strangerList = await request(app)
      .get('/api/capsules')
      .set('Cookie', stranger)
      .expect(200);
    assert.deepEqual(strangerList.body, []);

    await request(app)
      .put(`/api/capsules/${created.body.id}`)
      .set('Cookie', stranger)
      .send({ ...capsule, prompt_title: 'Not allowed' })
      .expect(404);

    await request(app)
      .delete(`/api/capsules/${created.body.id}`)
      .set('Cookie', stranger)
      .expect(404);

    const updated = await request(app)
      .put(`/api/capsules/${created.body.id}`)
      .set('Cookie', owner)
      .send({ ...capsule, prompt_version: 'v4', notes: 'Verified after revision.' })
      .expect(200);
    assert.equal(updated.body.prompt_version, 'v4');

    await request(app)
      .delete(`/api/capsules/${created.body.id}`)
      .set('Cookie', owner)
      .expect(204);

    const empty = await request(app)
      .get('/api/capsules')
      .set('Cookie', owner)
      .expect(200);
    assert.deepEqual(empty.body, []);
  });

  test('invalid records return a useful 400 response', async () => {
    const response = await request(app)
      .post('/api/capsules')
      .set('Cookie', owner)
      .send({ project_name: '', prompt_title: '', prompt_text: '' })
      .expect(400);
    assert.match(response.body.error, /required/i);
  });
});
