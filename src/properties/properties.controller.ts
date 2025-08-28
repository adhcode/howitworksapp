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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  async create(@Request() req, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(req.user.id, createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties for the authenticated landlord' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  async findAll(@Request() req, @Query() pagination: PaginationDto) {
    const result = await this.propertiesService.findAll(req.user.id, pagination);
    
    return {
      data: result.data,
      meta: {
        total: result.total,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: Math.ceil(result.total / (pagination.limit || 10)),
        hasNextPage: (pagination.page || 1) * (pagination.limit || 10) < result.total,
        hasPrevPage: (pagination.page || 1) > 1,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get property statistics for the authenticated landlord' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.propertiesService.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific property' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.propertiesService.findOne(id, req.user.id);
  }

  @Get(':id/with-units')
  @ApiOperation({ summary: 'Get a property with its units' })
  @ApiResponse({ status: 200, description: 'Property with units retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findWithUnits(@Request() req, @Param('id') id: string) {
    return this.propertiesService.findWithUnits(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, req.user.id, updatePropertyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async remove(@Request() req, @Param('id') id: string) {
    await this.propertiesService.remove(id, req.user.id);
    return { message: 'Property deleted successfully' };
  }
}