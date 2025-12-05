"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get IsAfterOriginalExpiry () {
        return IsAfterOriginalExpiry;
    },
    get IsAfterOriginalExpiryConstraint () {
        return IsAfterOriginalExpiryConstraint;
    },
    get IsFutureDate () {
        return IsFutureDate;
    },
    get IsFutureDateConstraint () {
        return IsFutureDateConstraint;
    },
    get IsReasonableRentAmount () {
        return IsReasonableRentAmount;
    },
    get IsReasonableRentAmountConstraint () {
        return IsReasonableRentAmountConstraint;
    },
    get IsValidContractDuration () {
        return IsValidContractDuration;
    },
    get IsValidContractDurationConstraint () {
        return IsValidContractDurationConstraint;
    },
    get IsValidOriginalExpiry () {
        return IsValidOriginalExpiry;
    },
    get IsValidOriginalExpiryConstraint () {
        return IsValidOriginalExpiryConstraint;
    }
});
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let IsFutureDateConstraint = class IsFutureDateConstraint {
    validate(date, args) {
        if (!date) return false;
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        return inputDate > today;
    }
    defaultMessage(args) {
        return `${args.property} must be a future date`;
    }
};
IsFutureDateConstraint = _ts_decorate([
    (0, _classvalidator.ValidatorConstraint)({
        async: false
    })
], IsFutureDateConstraint);
function IsFutureDate(validationOptions) {
    return function(object, propertyName) {
        (0, _classvalidator.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFutureDateConstraint
        });
    };
}
let IsAfterOriginalExpiryConstraint = class IsAfterOriginalExpiryConstraint {
    validate(expiryDate, args) {
        const object = args.object;
        if (!object.originalExpiryDate || !expiryDate) {
            return true; // Skip validation if either date is missing
        }
        const expiry = new Date(expiryDate);
        const originalExpiry = new Date(object.originalExpiryDate);
        return expiry > originalExpiry;
    }
    defaultMessage(args) {
        return 'Expiry date must be after the original expiry date for existing tenants';
    }
};
IsAfterOriginalExpiryConstraint = _ts_decorate([
    (0, _classvalidator.ValidatorConstraint)({
        async: false
    })
], IsAfterOriginalExpiryConstraint);
function IsAfterOriginalExpiry(validationOptions) {
    return function(object, propertyName) {
        (0, _classvalidator.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAfterOriginalExpiryConstraint
        });
    };
}
let IsReasonableRentAmountConstraint = class IsReasonableRentAmountConstraint {
    validate(amount, args) {
        if (typeof amount !== 'number') return false;
        // Rent should be between 1,000 and 10,000,000 (reasonable range)
        return amount >= 1000 && amount <= 10000000;
    }
    defaultMessage(args) {
        return 'Monthly rent amount must be between ₦1,000 and ₦10,000,000';
    }
};
IsReasonableRentAmountConstraint = _ts_decorate([
    (0, _classvalidator.ValidatorConstraint)({
        async: false
    })
], IsReasonableRentAmountConstraint);
function IsReasonableRentAmount(validationOptions) {
    return function(object, propertyName) {
        (0, _classvalidator.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsReasonableRentAmountConstraint
        });
    };
}
let IsValidContractDurationConstraint = class IsValidContractDurationConstraint {
    validate(expiryDate, args) {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        // Calculate months difference
        const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
        // Contract should be between 3 months and 60 months (5 years)
        return monthsDiff >= 3 && monthsDiff <= 60;
    }
    defaultMessage(args) {
        return 'Contract duration must be between 3 months and 5 years from today';
    }
};
IsValidContractDurationConstraint = _ts_decorate([
    (0, _classvalidator.ValidatorConstraint)({
        async: false
    })
], IsValidContractDurationConstraint);
function IsValidContractDuration(validationOptions) {
    return function(object, propertyName) {
        (0, _classvalidator.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidContractDurationConstraint
        });
    };
}
let IsValidOriginalExpiryConstraint = class IsValidOriginalExpiryConstraint {
    validate(originalExpiryDate, args) {
        const object = args.object;
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
    defaultMessage(args) {
        return 'Original expiry date must be within 6 months from today for existing tenants';
    }
};
IsValidOriginalExpiryConstraint = _ts_decorate([
    (0, _classvalidator.ValidatorConstraint)({
        async: false
    })
], IsValidOriginalExpiryConstraint);
function IsValidOriginalExpiry(validationOptions) {
    return function(object, propertyName) {
        (0, _classvalidator.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidOriginalExpiryConstraint
        });
    };
}

//# sourceMappingURL=custom-validators.js.map