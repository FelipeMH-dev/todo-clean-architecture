import { Format } from 'logform';
import { transports, createLogger, format, Logger } from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const nestLikeFormat: Format = nestWinstonModuleUtilities.format.nestLike(
  'App',
  {
    prettyPrint: true,
  },
);

export const winstonConfig: Logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        nestLikeFormat,
      ),
    }),
    new transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});
