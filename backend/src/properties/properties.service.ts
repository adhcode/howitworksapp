import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { properties, units, Property, NewProperty } from '../database/schema';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async create(landlordId: string, createPropertyDto: CreatePropertyDto): Promise<Property> {
    const propertyData: NewProperty = {
      ...createPropertyDto,
      landlordId,
    };

    const [property] = await this.db.insert(properties).values(propertyData).returning();
    return property;
  }

  async findAll(landlordId: string, pagination: PaginationDto): Promise<{ data: Property[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      this.db
        .select()
        .from(properties)
        .where(eq(properties.landlordId, landlordId))
        .limit(limit)
        .offset(offset)
        .orderBy(properties.createdAt),
      this.db
        .select({ count: properties.id })
        .from(properties)
        .where(eq(properties.landlordId, landlordId)),
    ]);

    return {
      data,
      total: totalResult.length,
    };
  }

  async findOne(id: string, landlordId: string): Promise<Property> {
    const [property] = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.landlordId, landlordId)));

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async findWithUnits(id: string, landlordId: string) {
    const property = await this.findOne(id, landlordId);
    
    const propertyUnits = await this.db
      .select()
      .from(units)
      .where(eq(units.propertyId, id))
      .orderBy(units.unitNumber);

    return {
      ...property,
      units: propertyUnits,
    };
  }

  async update(id: string, landlordId: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    // Verify ownership
    await this.findOne(id, landlordId);

    const [updatedProperty] = await this.db
      .update(properties)
      .set({ ...updatePropertyDto, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();

    return updatedProperty;
  }

  async remove(id: string, landlordId: string): Promise<void> {
    // Verify ownership
    await this.findOne(id, landlordId);

    // Delete associated units first
    await this.db.delete(units).where(eq(units.propertyId, id));
    
    // Delete property
    await this.db.delete(properties).where(eq(properties.id, id));
  }

  async getStats(landlordId: string) {
    const [propertiesCount, unitsCount, occupiedUnits] = await Promise.all([
      this.db
        .select({ count: properties.id })
        .from(properties)
        .where(eq(properties.landlordId, landlordId)),
      this.db
        .select({ count: units.id })
        .from(units)
        .innerJoin(properties, eq(units.propertyId, properties.id))
        .where(eq(properties.landlordId, landlordId)),
      this.db
        .select({ count: units.id })
        .from(units)
        .innerJoin(properties, eq(units.propertyId, properties.id))
        .where(and(
          eq(properties.landlordId, landlordId),
          eq(units.isAvailable, false)
        )),
    ]);

    return {
      totalProperties: propertiesCount.length,
      totalUnits: unitsCount.length,
      occupiedUnits: occupiedUnits.length,
      vacantUnits: unitsCount.length - occupiedUnits.length,
    };
  }
}