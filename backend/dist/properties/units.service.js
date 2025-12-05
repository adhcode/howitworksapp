"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UnitsService", {
    enumerable: true,
    get: function() {
        return UnitsService;
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
let UnitsService = class UnitsService {
    async create(propertyId, landlordId, createUnitDto) {
        // Debug logging to see what data is received
        console.log('🔍 Backend - CreateUnitDto received:', createUnitDto);
        console.log('🔍 Backend - Rent value:', createUnitDto.rent, 'typeof:', typeof createUnitDto.rent);
        // Verify property ownership
        const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
        if (!property) {
            throw new _common.NotFoundException('Property not found');
        }
        // Ensure numeric values are properly handled
        const rentValue = Number(createUnitDto.rent);
        const bathroomsValue = Number(createUnitDto.bathrooms);
        const squareFootageValue = createUnitDto.squareFootage ? Number(createUnitDto.squareFootage) : null;
        const depositValue = createUnitDto.deposit ? Number(createUnitDto.deposit) : null;
        const unitData = {
            propertyId,
            unitNumber: createUnitDto.unitNumber,
            bedrooms: createUnitDto.bedrooms,
            bathrooms: isNaN(bathroomsValue) ? '1' : bathroomsValue.toString(),
            squareFootage: squareFootageValue != null && !isNaN(squareFootageValue) ? squareFootageValue.toString() : null,
            rent: isNaN(rentValue) ? '0' : rentValue.toString(),
            deposit: depositValue != null && !isNaN(depositValue) ? depositValue.toString() : null,
            description: createUnitDto.description,
            images: createUnitDto.images,
            amenities: createUnitDto.amenities
        };
        console.log('🔍 Backend - Unit data to be saved:', unitData);
        const [unit] = await this.db.insert(_schema.units).values(unitData).returning();
        return unit;
    }
    async findAll(propertyId, landlordId) {
        // Verify property ownership
        const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
        if (!property) {
            throw new _common.NotFoundException('Property not found');
        }
        return this.db.select().from(_schema.units).where((0, _drizzleorm.eq)(_schema.units.propertyId, propertyId)).orderBy(_schema.units.unitNumber);
    }
    async findOne(id, landlordId) {
        const [unit] = await this.db.select({
            id: _schema.units.id,
            propertyId: _schema.units.propertyId,
            unitNumber: _schema.units.unitNumber,
            bedrooms: _schema.units.bedrooms,
            bathrooms: _schema.units.bathrooms,
            squareFootage: _schema.units.squareFootage,
            rent: _schema.units.rent,
            deposit: _schema.units.deposit,
            description: _schema.units.description,
            images: _schema.units.images,
            amenities: _schema.units.amenities,
            isAvailable: _schema.units.isAvailable,
            createdAt: _schema.units.createdAt,
            updatedAt: _schema.units.updatedAt
        }).from(_schema.units).innerJoin(_schema.properties, (0, _drizzleorm.eq)(_schema.units.propertyId, _schema.properties.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.units.id, id), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
        if (!unit) {
            throw new _common.NotFoundException('Unit not found');
        }
        return unit;
    }
    async update(id, landlordId, updateUnitDto) {
        // Verify ownership
        await this.findOne(id, landlordId);
        const updateData = {
            ...updateUnitDto,
            updatedAt: new Date()
        };
        // Convert number fields to strings for decimal columns
        if (updateUnitDto.bathrooms !== undefined) {
            updateData.bathrooms = updateUnitDto.bathrooms.toString();
        }
        if (updateUnitDto.squareFootage !== undefined) {
            updateData.squareFootage = updateUnitDto.squareFootage.toString();
        }
        if (updateUnitDto.rent !== undefined) {
            updateData.rent = updateUnitDto.rent.toString();
        }
        if (updateUnitDto.deposit !== undefined) {
            updateData.deposit = updateUnitDto.deposit.toString();
        }
        const [updatedUnit] = await this.db.update(_schema.units).set(updateData).where((0, _drizzleorm.eq)(_schema.units.id, id)).returning();
        return updatedUnit;
    }
    async remove(id, landlordId) {
        // Verify ownership
        await this.findOne(id, landlordId);
        await this.db.delete(_schema.units).where((0, _drizzleorm.eq)(_schema.units.id, id));
    }
    async getAvailableUnits(propertyId, landlordId) {
        // Verify property ownership
        const [property] = await this.db.select().from(_schema.properties).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.properties.id, propertyId), (0, _drizzleorm.eq)(_schema.properties.landlordId, landlordId)));
        if (!property) {
            throw new _common.NotFoundException('Property not found');
        }
        return this.db.select().from(_schema.units).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.units.propertyId, propertyId), (0, _drizzleorm.eq)(_schema.units.isAvailable, true))).orderBy(_schema.units.unitNumber);
    }
    constructor(db){
        this.db = db;
    }
};
UnitsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_databasemodule.DATABASE_CONNECTION)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ])
], UnitsService);

//# sourceMappingURL=units.service.js.map