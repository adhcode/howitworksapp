import { IsString, IsNotEmpty, IsOptional, IsInt, IsDecimal, IsBoolean, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: '1A' })
  @IsString()
  @IsNotEmpty()
  unitNumber: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ example: 2.5 })
  @Type(() => Number)
  bathrooms: number;

  @ApiPropertyOptional({ example: 1200.50 })
  @IsOptional()
  @Type(() => Number)
  squareFootage?: number;

  @ApiProperty({ example: 250000 })
  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  rent: number;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  deposit?: number;

  @ApiPropertyOptional({ example: 'Spacious unit with great view' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['unit1.jpg', 'unit2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['Balcony', 'Air Conditioning'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: '1A-Updated' })
  @IsOptional()
  @IsString()
  unitNumber?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @Type(() => Number)
  bathrooms?: number;

  @ApiPropertyOptional({ example: 1400.75 })
  @IsOptional()
  @Type(() => Number)
  squareFootage?: number;

  @ApiPropertyOptional({ example: 300000 })
  @IsOptional()
  @Type(() => Number)
  rent?: number;

  @ApiPropertyOptional({ example: 600000 })
  @IsOptional()
  @Type(() => Number)
  deposit?: number;

  @ApiPropertyOptional({ example: 'Updated unit description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['unit1.jpg', 'unit2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: ['Balcony', 'Air Conditioning'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}