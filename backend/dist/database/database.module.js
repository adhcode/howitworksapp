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
    get DATABASE_CONNECTION () {
        return DATABASE_CONNECTION;
    },
    get DatabaseModule () {
        return DatabaseModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _postgresjs = require("drizzle-orm/postgres-js");
const _postgres = /*#__PURE__*/ _interop_require_default(require("postgres"));
const _schema = /*#__PURE__*/ _interop_require_wildcard(require("./schema"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
let DatabaseModule = class DatabaseModule {
};
DatabaseModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _config.ConfigModule
        ],
        providers: [
            {
                provide: DATABASE_CONNECTION,
                useFactory: async (configService)=>{
                    const connectionString = configService.get('DATABASE_URL');
                    if (!connectionString) {
                        throw new Error('DATABASE_URL environment variable is required');
                    }
                    // Create postgres client with SSL support
                    const client = (0, _postgres.default)(connectionString, {
                        max: 10,
                        ssl: configService.get('DB_SSL') === 'false' ? false : {
                            rejectUnauthorized: false
                        }
                    });
                    // Create and return drizzle instance
                    const db = (0, _postgresjs.drizzle)(client, {
                        schema: _schema
                    });
                    return db;
                },
                inject: [
                    _config.ConfigService
                ]
            }
        ],
        exports: [
            DATABASE_CONNECTION
        ]
    })
], DatabaseModule);

//# sourceMappingURL=database.module.js.map