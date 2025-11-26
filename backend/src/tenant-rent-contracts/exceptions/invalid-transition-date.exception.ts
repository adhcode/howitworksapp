import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTransitionDateError extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Invalid Transition Date',
        message: `Invalid transition date: ${message}`,
        details,
      },
      HttpStatus.BAD_REQUEST,
    );
    this.name = 'InvalidTransitionDateError';
  }
}