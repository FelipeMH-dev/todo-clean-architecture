import { JwtStrategy } from '../jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let configService: ConfigService;


  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if JWT_SECRET is not defined', () => {
      configService = {
        get: jest.fn().mockReturnValue(undefined),
      } as any;

      expect(() => new JwtStrategy(configService)).toThrow(
        'JWT_SECRET is not defined',
      );
    });

    it('should create strategy when JWT_SECRET is defined', () => {
      configService = {
        get: jest.fn().mockReturnValue('super-secret'),
      } as any;

      const strategy = new JwtStrategy(configService);

      expect(strategy).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return mapped user from payload', async () => {
      configService = {
        get: jest.fn().mockReturnValue('secret'),
      } as any;

      const strategy = new JwtStrategy(configService);

      const payload = {
        sub: '123',
        email: 'test@mail.com',
        iat: 123456,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: '123',
        email: 'test@mail.com',
      });
    });

    it('should ignore extra payload fields', async () => {
      configService = {
        get: jest.fn().mockReturnValue('secret'),
      } as any;

      const strategy = new JwtStrategy(configService);

      const payload = {
        sub: '999',
        email: 'ignore@mail.com',
        role: 'admin',
        random: 'data',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: '999',
        email: 'ignore@mail.com',
      });
    });
  });
});