"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: './src/database/schema/*.ts',
    out: './src/database/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/homezy_db',
    },
    verbose: true,
    strict: true,
});
//# sourceMappingURL=drizzle.config.js.map