"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PropertiesService", {
    enumerable: true,
    get: function() {
        return PropertiesService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _databasemodule = require("../database/database.module");
const _schema = require("../database/schema");
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
let PropertiesService = class PropertiesService {
    async create(landlordId, createPropertyDto) {
        const propertyData = {
            ...createPropertyDto,
            landlordId
        };
        const [property] = await this.db.insert(_schema.properties).values(propertyData).returning();
        return property;
    }
    async findAll(landlordId, pagination) {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;
        const [data, totalResult] = await Promise.all([
            this.db.select().from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)).limit(limit).offset(offset).orderBy(_schema.properties.createdAt),
            this.db.select({
                count: _schema.properties.id
            }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId))
        ]);
        return {
            data,
            total: totalResult.length
        };
    }
    async findOne(id, landlordId) {
        const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, id), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
        if (!property) {
            throw new _common.NotFoundException('Property not found');
        }
        return property;
    }
    async findWithUnits(id, landlordId) {
        const property = await this.findOne(id, landlordId);
        const propertyUnits = await this.db.select().from(_schema.units).where((0, _drizzleorm.eq)(_schema.units.propertyId, id)).orderBy(_schema.units.unitNumber);
        return {
            ...property,
            units: propertyUnits
        };
    }
    async update(id, landlordId, updatePropertyDto) {
        // Verify ownership
        await this.findOne(id, landlordId);
        const [updatedProperty] = await this.db.update(_schema.properties).set({
            ...updatePropertyDto,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.properties.id, id)).returning();
        return updatedProperty;
    }
    async remove(id, landlordId) {
        // Verify ownership
        await this.findOne(id, landlordId);
        // Delete associated units first
        await this.db.delete(_schema.units).where((0, _drizzleorm.eq)(_schema.units.propertyId, id));
        // Delete property
        await this.db.delete(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.id, id));
    }
    async getStats(landlordId) {
        const [propertiesCount, unitsCount, occupiedUnits] = await Promise.all([
            this.db.select({
                count: _schema.properties.id
            }).from(_schema.properties).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)),
            this.db.select({
                count: _schema.units.id
            }).from(_schema.units).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.units.propertyId, _schema.properties.id)).where((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)),
            this.db.select({
                count: _schema.units.id
            }).from(_schema.units).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.units.propertyId, _schema.properties.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId), (0, _drizzleorm.eq)(_schema.units.isAvailable, false)))
        ]);
        return {
            totalProperties: propertiesCount.length,
            totalUnits: unitsCount.length,
            occupiedUnits: occupiedUnits.length,
            vacantUnits: unitsCount.length - occupiedUnits.length
        };
    }
    constructor(db){
        this.db = db;
    }
};
PropertiesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], PropertiesService);

//# sourceMappingURL=properties.service.js.map