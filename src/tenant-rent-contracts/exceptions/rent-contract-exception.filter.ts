import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ContractNotFoundError } from './contract-not-found.exception';
import { InvalidTransitionDateError } from './invalid-transition-date.exception';
import { EscrowReleaseError } from './escrow-release.exception';

@Catch()
export class RentContractExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RentContractExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Handle specific rent contract exceptions
    if (exception instanceof ContractNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      errorResponse = {
        ...errorResponse,
        statusCode: status,
        error: 'Contract Not Found',
        message: exception.message,
        contractId: exception.getResponse()['contractId'],
      };
    } else if (exception instanceof InvalidTransitionDateError) {
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        ...errorResponse,
        statusCode: status,
        error: 'Invalid Transition Date',
        message: exception.message,
        details: exception.getResponse()['details'],
      };
    } else if (exception instanceof EscrowReleaseError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        ...errorResponse,
        statusCode: status,
        error: 'Escrow Release Failed',
        message: exception.message,
        escrowId: exception.getResponse()['escrowId'],
        details: exception.getResponse()['details'],
      };
    } else if (exception instanceof HttpException) {
      // Handle other HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      errorResponse = {
        ...errorResponse,
        statusCode: status,
        error: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse['error'],
        message: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse['message'],
      };
    } else {
      // Handle unexpected errors
      errorResponse = {
        ...errorResponse,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing the rent contract request',
      };
      
      // Log the full error for debugging
      this.logger.error(
        `Unexpected error in rent contract operation: ${exception.message}`,
        exception.stack,
      );
    }

    // Log the error with context
    this.logger.error(
      `Rent Contract Error - ${request.method} ${request.url} - Status: ${status} - ${errorResponse.message}`,
      {
        exception: exception.name,
        statusCode: status,
        path: request.url,
        method: request.method,
        timestamp: errorResponse.timestamp,
      },
    );

    response.status(status).json(errorResponse);
  }
}