import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ContractNotFoundError } from './contract-not-found.exception';
import { InvalidTransitionDateError } from './invalid-transition-date.exception';
import { EscrowReleaseError } from './escrow-release.exception';
import { RentContractExceptionFilter } from './rent-contract-exception.filter';

describe('Rent Contract Exceptions', () => {
  describe('ContractNotFoundError', () => {
    it('should create error with correct message and status', () => {
      const contractId = 'test-contract-id';
      const error = new ContractNotFoundError(contractId);

      expect(error.name).toBe('ContractNotFoundError');
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(error.message).toContain(contractId);
      
      const response = error.getResponse() as any;
      expect(response.contractId).toBe(contractId);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('InvalidTransitionDateError', () => {
    it('should create error with correct message and details', () => {
      const message = 'Invalid date provided';
      const details = { expiryDate: '2024-01-01', reason: 'too early' };
      const error = new InvalidTransitionDateError(message, details);

      expect(error.name).toBe('InvalidTransitionDateError');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(error.message).toContain(message);
      
      const response = error.getResponse() as any;
      expect(response.details).toEqual(details);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('EscrowReleaseError', () => {
    it('should create error with escrow details', () => {
      const message = 'Release failed';
      const escrowId = 'escrow-123';
      const details = { amount: 1000, reason: 'insufficient funds' };
      const error = new EscrowReleaseError(message, escrowId, details);

      expect(error.name).toBe('EscrowReleaseError');
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.message).toContain(message);
      
      const response = error.getResponse() as any;
      expect(response.escrowId).toBe(escrowId);
      expect(response.details).toEqual(details);
    });
  });

  describe('RentContractExceptionFilter', () => {
    let filter: RentContractExceptionFilter;
    let mockResponse: any;
    let mockRequest: any;
    let mockHost: any;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RentContractExceptionFilter],
      }).compile();

      filter = module.get<RentContractExceptionFilter>(RentContractExceptionFilter);

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      mockRequest = {
        url: '/rent-contracts',
        method: 'POST',
      };

      mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      };
    });

    it('should handle ContractNotFoundError correctly', () => {
      const contractId = 'test-contract-id';
      const error = new ContractNotFoundError(contractId);

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Contract Not Found',
          contractId,
          timestamp: expect.any(String),
          path: '/rent-contracts',
          method: 'POST',
        })
      );
    });

    it('should handle InvalidTransitionDateError correctly', () => {
      const message = 'Invalid date';
      const details = { reason: 'test' };
      const error = new InvalidTransitionDateError(message, details);

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Invalid Transition Date',
          details,
        })
      );
    });

    it('should handle EscrowReleaseError correctly', () => {
      const message = 'Release failed';
      const escrowId = 'escrow-123';
      const error = new EscrowReleaseError(message, escrowId);

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Escrow Release Failed',
          escrowId,
        })
      );
    });

    it('should handle unexpected errors', () => {
      const error = new Error('Unexpected error');

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while processing the rent contract request',
        })
      );
    });
  });
});