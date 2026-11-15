import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
@Catch() export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const value = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const message = typeof value === 'string' ? value : (value as { message?: string | string[] }).message ?? 'Request failed';
    response.status(statusCode).json({ statusCode, message, error: HttpStatus[statusCode] ?? 'Error' });
  }
}
