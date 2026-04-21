// filename: src/shared/security/guards/api-key.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly headerName = 'x-api-key';

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.header(this.headerName) ?? '';

    const expected = process.env.API_KEY ?? '';
    if (!expected) {
       throw new Error('API_KEY is not configured');
    }

    if (provided && provided === expected) {
      return true;
    }

    throw new UnauthorizedException('Invalid API Key');
  }
}
