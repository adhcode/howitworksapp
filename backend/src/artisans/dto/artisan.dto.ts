import { IsString, IsEmail, IsOptional, IsInt, Min, Max, IsEnum, IsUUID } from 'class-validator';

export enum ArtisanSpecialty {
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  CARPENTER = 'Carpenter',
  PAINTER = 'Painter',
  MASON = 'Mason/Bricklayer',
  TILER = 'Tiler',
  WELDER = 'Welder',
  HVAC = 'HVAC Technician',
  ROOFER = 'Roofer',
  LANDSCAPER = 'Landscaper',
  HANDYMAN = 'General Handyman',
  OTHER = 'Other',
}

export enum ArtisanAvailability {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  WEEKENDS = 'Weekends',
  ON_CALL = 'On-call',
}

export enum ArtisanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  INACTIVE = 'inactive',
}

export class RegisterArtisanDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsEnum(ArtisanSpecialty)
  specialty: ArtisanSpecialty;

  @IsInt()
  @Min(0)
  @Max(50)
  yearsOfExperience: number;

  @IsString()
  refereeName: string;

  @IsString()
  refereePhone: string;

  @IsString()
  @IsOptional()
  additionalSkills?: string;

  @IsEnum(ArtisanAvailability)
  @IsOptional()
  availability?: ArtisanAvailability;

  @IsUUID()
  @IsOptional()
  referredByFacilitatorId?: string;
}

export class UpdateArtisanStatusDto {
  @IsEnum(ArtisanStatus)
  status: ArtisanStatus;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class ArtisanFiltersDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsEnum(ArtisanSpecialty)
  @IsOptional()
  specialty?: ArtisanSpecialty;

  @IsEnum(ArtisanStatus)
  @IsOptional()
  status?: ArtisanStatus;

  @IsUUID()
  @IsOptional()
  referredByFacilitatorId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  minExperience?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

export class ArtisanResponseDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  specialty: string;
  yearsOfExperience: number;
  refereeName: string;
  refereePhone: string;
  additionalSkills?: string;
  availability: string;
  status: string;
  referredByFacilitatorId?: string;
  referredByFacilitatorName?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
