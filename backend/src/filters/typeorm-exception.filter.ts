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
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // TypeORM wraps the driver error; access it via driverError
    const driverError = (exception as QueryFailedError & { driverError?: PostgresDriverError }).driverError;
    const code = driverError?.code;
    const detail = driverError?.detail;

    // Postgres error codes:
    // - 23505: unique_violation
    // - 22P02: invalid_text_representation (e.g., invalid uuid)
    if (code === '23505') {
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
