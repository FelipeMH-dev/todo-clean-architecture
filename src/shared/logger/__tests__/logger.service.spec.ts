import { AppLogger } from '../logger.service';
import { winstonConfig } from '../winston.logger';

jest.mock('../winston.logger', () => ({
  winstonConfig: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  },
}));

describe('AppLogger', () => {
  let logger: AppLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = new AppLogger();
  });

  describe('log', () => {
    it('should call winstonConfig.info with formatted object', () => {
      logger.log('Test message', { context: 'TestContext' });

      expect(winstonConfig.info).toHaveBeenCalledWith({
        message: 'Test message',
        context: 'TestContext',
        route: undefined,
        extra: undefined,
        status: undefined,
      });
    });

    it('should call winstonConfig.info with plain message object when no context', () => {
      logger.log('Simple message');

      expect(winstonConfig.info).toHaveBeenCalledWith({
        message: 'Simple message',
        context: undefined,
        route: undefined,
        extra: undefined,
        status: undefined,
      });
    });
  });

  describe('error', () => {
    it('should call winstonConfig.error with message object and trace', () => {
      logger.error('Error message', 'trace-info', { context: 'ErrCtx' });

      expect(winstonConfig.error).toHaveBeenCalledWith({
        message: 'Error message',
        context: 'ErrCtx',
        route: undefined,
        extra: undefined,
        status: undefined,
        trace: 'trace-info',
      });
    });

    it('should handle missing trace and options', () => {
      logger.error('Error without trace');

      expect(winstonConfig.error).toHaveBeenCalledWith({
        message: 'Error without trace',
        context: undefined,
        route: undefined,
        extra: undefined,
        status: undefined,
        trace: undefined,
      });
    });
  });

  describe('warn', () => {
    it('should call winstonConfig.warn correctly', () => {
      logger.warn('Warning!', { context: 'WarnCtx' });

      expect(winstonConfig.warn).toHaveBeenCalledWith({
        message: 'Warning!',
        context: 'WarnCtx',
        route: undefined,
        extra: undefined,
        status: undefined,
      });
    });
  });

  describe('debug', () => {
    it('should call winstonConfig.debug correctly', () => {
      logger.debug('Debug message', { context: 'DebugCtx' });

      expect(winstonConfig.debug).toHaveBeenCalledWith({
        message: 'Debug message',
        context: 'DebugCtx',
        route: undefined,
        extra: undefined,
        status: undefined,
      });
    });
  });

  describe('verbose', () => {
    it('should call winstonConfig.verbose correctly', () => {
      logger.verbose('Verbose message', { context: 'VerboseCtx' });

      expect(winstonConfig.verbose).toHaveBeenCalledWith({
        message: 'Verbose message',
        context: 'VerboseCtx',
        route: undefined,
        extra: undefined,
        status: undefined,
      });
    });
  });
});