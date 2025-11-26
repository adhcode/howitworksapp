import { HttpException, HttpStatus } from '@nestjs/common';

export class EscrowReleaseError extends HttpException {
  constructor(message: string, escrowId?: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Escrow Release Failed',
        message: `Escrow release failed: ${message}`,
        escrowId,
        details,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    this.name = 'EscrowReleaseError';
  }
}