import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RentContractValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform the object to the target type
      validateCustomDecorators: true, // Validate custom decorators
    });

    if (errors.length > 0) {
      const errorMessages = this.formatValidationErrors(errors);
      throw new BadRequestException({
        statusCode: 400,
        error: 'Validation Failed',
        message: 'Input validation failed for rent contract operation',
        details: errorMessages,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: any[]): any[] {
    return errors.map(error => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length > 0 ? this.formatValidationErrors(error.children) : undefined,
    }));
  }
}