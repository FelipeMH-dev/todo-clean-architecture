import { LoggingInterceptor } from '../logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { AppLogger } from '../../logger/logger.service';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;

    interceptor = new LoggingInterceptor(logger);
  });

  it('should log request method, url and execution time', (done) => {
    const mockRequest = {
      method: 'GET',
      url: '/test-endpoint',
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const callHandler: CallHandler = {
      handle: () => of('response'),
    };

    interceptor.intercept(context, callHandler).subscribe({
      next: () => {
        expect(logger.log).toHaveBeenCalledTimes(1);

        const logMessage = logger.log.mock.calls[0][0];
        expect(logMessage).toContain('GET /test-endpoint completed in');
        expect(logMessage).toContain('ms');

        done();
      },
    });
  });
});
