import { Controller, Get } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';

import { CurrentUser } from '../current-user.decorator';

@Controller()
class TestController {
  @Get()
  getUser(@CurrentUser() user: any) {
    return user;
  }
}

describe('CurrentUser (integration style)', () => {
  let app: any;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();

    // ✅ middleware tipado correctamente
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.user = { id: '1', email: 'test@mail.com' };
      next();
    });

    await app.init();
  });

  it('should return user from request', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .expect(200);

    expect(res.body).toEqual({
      id: '1',
      email: 'test@mail.com',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});