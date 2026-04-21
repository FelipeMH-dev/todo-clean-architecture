import { ApiKeyGuard } from '../api-key.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  const createContext = (apiKey?: string) => {
    const req: any = {
      header: (name: string) => {
        if (name === 'x-api-key') return apiKey;
        return undefined;
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    guard = new ApiKeyGuard();
    delete process.env.API_KEY;
  });

  it('should throw Error when API_KEY is not configured', () => {
    const context = createContext('anything');

    expect(() => guard.canActivate(context)).toThrow(
      'API_KEY is not configured',
    );
  });

  it('should allow request when api key matches', () => {
    process.env.API_KEY = 'valid-key';

    const context = createContext('valid-key');

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when api key does not match', () => {
    process.env.API_KEY = 'valid-key';

    const context = createContext('invalid-key');

    expect(() => guard.canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when api key header is missing', () => {
    process.env.API_KEY = 'valid-key';

    const context = createContext();

    expect(() => guard.canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });
});