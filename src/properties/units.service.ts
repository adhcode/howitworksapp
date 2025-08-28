import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { units, properties, Unit, NewUnit } from '../database/schema';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async create(propertyId: string, landlordId: string, createUnitDto: CreateUnitDto): Promise<Unit> {
    // Debug logging to see what data is received
    console.log('🔍 Backend - CreateUnitDto received:', createUnitDto);
    console.log('🔍 Backend - Rent value:', createUnitDto.rent, 'typeof:', typeof createUnitDto.rent);
    
    // Verify property ownership
    const [property] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId)));

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Ensure numeric values are properly handled
    const rentValue = Number(createUnitDto.rent);
    const bathroomsValue = Number(createUnitDto.bathrooms);
    const squareFootageValue = createUnitDto.squareFootage ? Number(createUnitDto.squareFootage) : null;
    const depositValue = createUnitDto.deposit ? Number(createUnitDto.deposit) : null;

    const unitData: NewUnit = {
      propertyId,
      unitNumber: createUnitDto.unitNumber,
      bedrooms: createUnitDto.bedrooms,
      bathrooms: isNaN(bathroomsValue) ? '1' : bathroomsValue.toString(),
      squareFootage: squareFootageValue != null && !isNaN(squareFootageValue) ? squareFootageValue.toString() : null,
      rent: isNaN(rentValue) ? '0' : rentValue.toString(),
      deposit: depositValue != null && !isNaN(depositValue) ? depositValue.toString() : null,
      description: createUnitDto.description,
      images: createUnitDto.images,
      amenities: createUnitDto.amenities,
    };
    
    console.log('🔍 Backend - Unit data to be saved:', unitData);

    const [unit] = await this.db.insert(units).values(unitData).returning();
    return unit;
  }

  async findAll(propertyId: string, landlordId: string): Promise<Unit[]> {
    // Verify property ownership
    const [property] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId)));

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.db
      .select()
      .from(units)
      .where(eq(units.propertyId, propertyId))
      .orderBy(units.unitNumber);
  }

  async findOne(id: string, landlordId: string): Promise<Unit> {
    const [unit] = await this.db
      .select({
        id: units.id,
        propertyId: units.propertyId,
        unitNumber: units.unitNumber,
        bedrooms: units.bedrooms,
        bathrooms: units.bathrooms,
        squareFootage: units.squareFootage,
        rent: units.rent,
        deposit: units.deposit,
        description: units.description,
        images: units.images,
        amenities: units.amenities,
        isAvailable: units.isAvailable,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
      })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, id), eq(properties.landlordId, landlordId)));

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async update(id: string, landlordId: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    // Verify ownership
    await this.findOne(id, landlordId);

    const updateData: any = {
      ...updateUnitDto,
      updatedAt: new Date(),
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

    const [updatedUnit] = await this.db
      .update(units)
      .set(updateData)
      .where(eq(units.id, id))
      .returning();

    return updatedUnit;
  }

  async remove(id: string, landlordId: string): Promise<void> {
    // Verify ownership
    await this.findOne(id, landlordId);

    await this.db.delete(units).where(eq(units.id, id));
  }

  async getAvailableUnits(propertyId: string, landlordId: string): Promise<Unit[]> {
    // Verify property ownership
    const [property] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.landlordId, landlordId)));

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.db
      .select()
      .from(units)
      .where(and(eq(units.propertyId, propertyId), eq(units.isAvailable, true)))
      .orderBy(units.unitNumber);
  }
}