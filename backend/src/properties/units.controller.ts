import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

@ApiTags('Units')
@Controller('properties/:propertyId/units')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unit for a property' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  async create(
    @Request() req,
    @Param('propertyId') propertyId: string,
    @Body() createUnitDto: CreateUnitDto,
  ) {
    console.log('🔍 Controller - Raw body from request:', req.body);
    console.log('🔍 Controller - Processed DTO:', createUnitDto);
    console.log('🔍 Controller - DTO rent type:', typeof createUnitDto.rent, 'value:', createUnitDto.rent);
    
    return this.unitsService.create(propertyId, req.user.id, createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units for a property' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  async findAll(@Request() req, @Param('propertyId') propertyId: string) {
    return this.unitsService.findAll(propertyId, req.user.id);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available units for a property' })
  @ApiResponse({ status: 200, description: 'Available units retrieved successfully' })
  async getAvailable(@Request() req, @Param('propertyId') propertyId: string) {
    return this.unitsService.getAvailableUnits(propertyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific unit' })
  @ApiResponse({ status: 200, description: 'Unit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.unitsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, req.user.id, updateUnitDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async remove(@Request() req, @Param('id') id: string) {
    await this.unitsService.remove(id, req.user.id);
    return { message: 'Unit deleted successfully' };
  }
}