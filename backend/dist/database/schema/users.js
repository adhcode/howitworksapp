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
    get userRoleEnum () {
        return userRoleEnum;
    },
    get users () {
        return users;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const userRoleEnum = (0, _pgcore.pgEnum)('user_role', [
    'landlord',
    'tenant',
    'admin',
    'facilitator'
]);
const users = (0, _pgcore.pgTable)('users', {
    id: (0, _pgcore.uuid)('id').defaultRandom().primaryKey(),
    firstName: (0, _pgcore.varchar)('first_name', {
        length: 100
    }).notNull(),
    lastName: (0, _pgcore.varchar)('last_name', {
        length: 100
    }).notNull(),
    email: (0, _pgcore.varchar)('email', {
        length: 255
    }).notNull().unique(),
    password: (0, _pgcore.varchar)('password', {
        length: 255
    }).notNull(),
    phoneNumber: (0, _pgcore.varchar)('phone_number', {
        length: 20
    }).notNull(),
    role: userRoleEnum('role').notNull(),
    nextOfKinName: (0, _pgcore.varchar)('next_of_kin_name', {
        length: 100
    }),
    nextOfKinPhone: (0, _pgcore.varchar)('next_of_kin_phone', {
        length: 20
    }),
    nextOfKinRelationship: (0, _pgcore.varchar)('next_of_kin_relationship', {
        length: 50
    }),
    avatar: (0, _pgcore.text)('avatar'),
    isActive: (0, _pgcore.boolean)('is_active').default(true),
    isEmailVerified: (0, _pgcore.boolean)('is_email_verified').default(false),
    emailVerificationToken: (0, _pgcore.varchar)('email_verification_token', {
        length: 255
    }),
    emailVerificationCode: (0, _pgcore.varchar)('email_verification_code', {
        length: 6
    }),
    emailVerificationCodeExpires: (0, _pgcore.timestamp)('email_verification_code_expires'),
    passwordResetToken: (0, _pgcore.varchar)('password_reset_token', {
        length: 255
    }),
    passwordResetExpires: (0, _pgcore.timestamp)('password_reset_expires'),
    passwordResetCode: (0, _pgcore.varchar)('password_reset_code', {
        length: 6
    }),
    passwordResetCodeExpires: (0, _pgcore.timestamp)('password_reset_code_expires'),
    // Paystack payment fields (for tenants - recurring payments)
    paystackAuthorizationCode: (0, _pgcore.varchar)('paystack_authorization_code', {
        length: 255
    }),
    paystackCardLast4: (0, _pgcore.varchar)('paystack_card_last4', {
        length: 4
    }),
    paystackCardBrand: (0, _pgcore.varchar)('paystack_card_brand', {
        length: 50
    }),
    paystackCardBank: (0, _pgcore.varchar)('paystack_card_bank', {
        length: 100
    }),
    // Paystack payout fields (for landlords - cashouts)
    paystackRecipientCode: (0, _pgcore.varchar)('paystack_recipient_code', {
        length: 255
    }),
    bankAccountName: (0, _pgcore.varchar)('bank_account_name', {
        length: 255
    }),
    bankAccountNumber: (0, _pgcore.varchar)('bank_account_number', {
        length: 20
    }),
    bankCode: (0, _pgcore.varchar)('bank_code', {
        length: 10
    }),
    lastLoginAt: (0, _pgcore.timestamp)('last_login_at'),
    createdAt: (0, _pgcore.timestamp)('created_at').defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at').defaultNow()
});

//# sourceMappingURL=users.js.map