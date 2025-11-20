import { HttpException, HttpStatus } from '@nestjs/common';

export class ContractNotFoundError extends HttpException {
  constructor(contractId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Contract Not Found',
        message: `Rent contract not found: ${contractId}`,
        contractId,
      },
      HttpStatus.NOT_FOUND,
    );
    this.name = 'ContractNotFoundError';
  }
}