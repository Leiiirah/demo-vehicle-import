import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface PostgresDriverError {
  code?: string;
  detail?: string;
  constraint?: string;
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // TypeORM error shape differs a bit across versions.
    // Try the common locations for the underlying Postgres error.
    const anyEx = exception as unknown as {
      code?: string;
      detail?: string;
      driverError?: PostgresDriverError;
      cause?: PostgresDriverError;
      message?: string;
    };

    const driverError = anyEx.driverError ?? anyEx.cause;
    const code = driverError?.code ?? anyEx.code;
    const detail = driverError?.detail ?? anyEx.detail;
    const message = anyEx.message ?? '';

    // Postgres error codes:
    // - 23505: unique_violation
    // - 22P02: invalid_text_representation (e.g., invalid uuid)
    // Some environments may not expose the code reliably; fall back to message match.
    if (code === '23505' || /duplicate key value violates unique constraint/i.test(message)) {
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Conflict',
        error: detail ?? 'Unique constraint violation',
      });
    }

    if (code === '22P02') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        error: detail ?? 'Invalid input syntax',
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }
}
