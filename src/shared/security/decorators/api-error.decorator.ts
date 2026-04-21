import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthAndValidationErrors() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Missing or invalid API Key',
      schema: {
        example: {
          error: 'Unauthorized',
          message: 'Invalid API Key',
          code: 401,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Validation error (email format)',
      schema: {
        example: {
          error: 'Bad Request',
          message: ['email must be an email'],
          code: 400,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Validation error (password rules)',
      schema: {
        example: {
          error: 'Bad Request',
          message: [
            'password must be shorter than or equal to 100 characters',
            'password must be longer than or equal to 6 characters',
            'password must be a string',
          ],
          code: 400,
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Validation error (email constraints)',
      schema: {
        example: {
          error: 'Bad Request',
          message: [
            'email must be shorter than or equal to 50 characters',
            'email must be an email',
          ],
          code: 400,
        },
      },
    }),
  );
}