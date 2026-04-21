import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../app.module';

describe('E2E - Auth + Tasks Flow', () => {
  let app: INestApplication;

  let token: string;
  let taskId: string;

  const API_KEY = process.env.API_KEY!;
  const EMAIL = `test-${Date.now()}@mail.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register → should create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .set('x-api-key', API_KEY)
      .send({
        email: EMAIL,
        password: '123456',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe(EMAIL);
  });

  it('POST /auth/login → should return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .set('x-api-key', API_KEY)
      .send({
        email: EMAIL,
        password: '123456',
      });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();

    token = res.body.access_token;
  });

  it('POST /tasks → should create task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'E2E Task',
        description: 'Task created in E2E test',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('E2E Task');

    taskId = res.body.id;
  });

  it('GET /tasks → should return paginated user tasks', async () => {
    const res = await request(app.getHttpServer())
      .get('/tasks')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // estructura paginada
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('total');

    expect(Array.isArray(res.body.data)).toBe(true);

    // opcional (mejor práctica)
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
  });

  it('PATCH /tasks/:id → should update task', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task',
        status: 'done',
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.status).toBe('done');
  });

  it('DELETE /tasks/:id → should delete task', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });
});