import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// Custom validator for future dates
@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    if (!date) return false;
    
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return inputDate > today;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a future date`;
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}

// Custom validator for expiry date being after original expiry date
@ValidatorConstraint({ async: false })
export class IsAfterOriginalExpiryConstraint implements ValidatorConstraintInterface {
  validate(expiryDate: string, args: ValidationArguments) {
    const object = args.object as any;
    
    if (!object.originalExpiryDate || !expiryDate) {
      return true; // Skip validation if either date is missing
    }
    
    const expiry = new Date(expiryDate);
    const originalExpiry = new Date(object.originalExpiryDate);
    
    return expiry > originalExpiry;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Expiry date must be after the original expiry date for existing tenants';
  }
}

export function IsAfterOriginalExpiry(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAfterOriginalExpiryConstraint,
    });
  };
}

// Custom validator for reasonable rent amounts
@ValidatorConstraint({ async: false })
export class IsReasonableRentAmountConstraint implements ValidatorConstraintInterface {
  validate(amount: number, args: ValidationArguments) {
    if (typeof amount !== 'number') return false;
    
    // Rent should be between 1,000 and 10,000,000 (reasonable range)
    return amount >= 1000 && amount <= 10000000;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Monthly rent amount must be between ₦1,000 and ₦10,000,000';
  }
}

export function IsReasonableRentAmount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsReasonableRentAmountConstraint,
    });
  };
}

// Custom validator for contract duration (minimum 3 months, maximum 5 years)
@ValidatorConstraint({ async: false })
export class IsValidContractDurationConstraint implements ValidatorConstraintInterface {
  validate(expiryDate: string, args: ValidationArguments) {
    if (!expiryDate) return false;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    
    // Calculate months difference
    const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 + 
                      (expiry.getMonth() - today.getMonth());
    
    // Contract should be between 3 months and 60 months (5 years)
    return monthsDiff >= 3 && monthsDiff <= 60;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Contract duration must be between 3 months and 5 years from today';
  }
}

export function IsValidContractDuration(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidContractDurationConstraint,
    });
  };
}

// Custom validator for original expiry date being in the past or near future for existing tenants
@ValidatorConstraint({ async: false })
export class IsValidOriginalExpiryConstraint implements ValidatorConstraintInterface {
  validate(originalExpiryDate: string, args: ValidationArguments) {
    const object = args.object as any;
    
    if (!object.isExistingTenant) {
      return true; // Skip validation for new tenants
    }
    
    if (!originalExpiryDate) {
      return false; // Original expiry date is required for existing tenants
    }
    
    const originalExpiry = new Date(originalExpiryDate);
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    
    // Original expiry should be within 6 months from now (past or future)
    return originalExpiry <= sixMonthsFromNow;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Original expiry date must be within 6 months from today for existing tenants';
  }
}

export function IsValidOriginalExpiry(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidOriginalExpiryConstraint,
    });
  };
}