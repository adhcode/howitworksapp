"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SetupService", {
    enumerable: true,
    get: function() {
        return SetupService;
    }
});
const _common = require("@nestjs/common");
const _nodepostgres = require("drizzle-orm/node-postgres");
const _drizzleorm = require("drizzle-orm");
const _bcryptjs = /*#__PURE__*/ _interop_require_wildcard(require("bcryptjs"));
const _databasemodule = require("../database/database.module");
const _users = require("../database/schema/users");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let SetupService = class SetupService {
    async quickSetup() {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            throw new _common.BadRequestException('Quick setup is disabled in production');
        }
        const defaultAccounts = [
            {
                email: 'admin@howitworks.app',
                password: 'Admin@123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                phoneNumber: '+2348012345678'
            },
            {
                email: 'facilitator@howitworks.app',
                password: 'Facilitator@123',
                firstName: 'John',
                lastName: 'Facilitator',
                role: 'facilitator',
                phoneNumber: '+2348087654321'
            }
        ];
        const createdAccounts = [];
        const existingAccounts = [];
        for (const account of defaultAccounts){
            // Check if user already exists
            const [existingUser] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.email, account.email)).limit(1);
            if (existingUser) {
                existingAccounts.push({
                    role: account.role,
                    email: account.email,
                    status: 'already_exists'
                });
                continue;
            }
            // Hash password
            const hashedPassword = await _bcryptjs.hash(account.password, 12);
            // Create user
            const [newUser] = await this.db.insert(_users.users).values({
                email: account.email,
                password: hashedPassword,
                firstName: account.firstName,
                lastName: account.lastName,
                role: account.role,
                phoneNumber: account.phoneNumber,
                isActive: true,
                isEmailVerified: true
            }).returning();
            createdAccounts.push({
                role: account.role,
                email: account.email,
                password: account.password,
                status: 'created'
            });
        }
        return {
            success: true,
            message: 'Quick setup completed',
            created: createdAccounts,
            existing: existingAccounts,
            warning: 'Change these passwords immediately in production!'
        };
    }
    async createAccount(accountData) {
        // Validate role
        if (![
            'admin',
            'facilitator'
        ].includes(accountData.role)) {
            throw new _common.BadRequestException('Role must be either admin or facilitator');
        }
        // Check if user already exists
        const [existingUser] = await this.db.select().from(_users.users).where((0, _drizzleorm.eq)(_users.users.email, accountData.email)).limit(1);
        if (existingUser) {
            throw new _common.BadRequestException('User with this email already exists');
        }
        // Validate password length
        if (accountData.password.length < 6) {
            throw new _common.BadRequestException('Password must be at least 6 characters');
        }
        // Hash password
        const hashedPassword = await _bcryptjs.hash(accountData.password, 12);
        // Create user
        const [newUser] = await this.db.insert(_users.users).values({
            email: accountData.email,
            password: hashedPassword,
            firstName: accountData.firstName,
            lastName: accountData.lastName,
            role: accountData.role,
            phoneNumber: accountData.phoneNumber,
            isActive: true,
            isEmailVerified: true
        }).returning();
        return {
            success: true,
            message: `${accountData.role.charAt(0).toUpperCase() + accountData.role.slice(1)} account created successfully`,
            account: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                phoneNumber: newUser.phoneNumber
            }
        };
    }
    constructor(db){
        this.db = db;
    }
};
SetupService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nodepostgres.NodePgDatabase === "undefined" ? Object : _nodepostgres.NodePgDatabase
    ])
], SetupService);

//# sourceMappingURL=setup.service.js.map