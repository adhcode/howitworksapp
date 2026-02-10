import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { ArtisansService } from './artisans.service';
import {
  RegisterArtisanDto,
  UpdateArtisanStatusDto,
  ArtisanFiltersDto,
  ArtisanResponseDto,
} from './dto/artisan.dto';

@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) { }

  /**
   * PUBLIC: Register new artisan
   * No authentication required - public form
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerArtisan(@Body() dto: RegisterArtisanDto): Promise<ArtisanResponseDto> {
    return this.artisansService.registerArtisan(dto);
  }

  /**
   * ADMIN: Get all artisans with filters
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllArtisans(@Query() filters: ArtisanFiltersDto): Promise<ArtisanResponseDto[]> {
    return this.artisansService.getAllArtisans(filters);
  }

  /**
   * ADMIN: Get artisan by ID
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getArtisanById(@Param('id') id: string): Promise<ArtisanResponseDto> {
    return this.artisansService.getArtisanById(id);
  }

  /**
   * ADMIN: Update artisan status
   */
  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateArtisanStatus(
    @Param('id') id: string,
    @Body() dto: UpdateArtisanStatusDto,
  ): Promise<ArtisanResponseDto> {
    return this.artisansService.updateArtisanStatus(id, dto);
  }

  /**
   * ADMIN: Delete artisan
   */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArtisan(@Param('id') id: string): Promise<void> {
    return this.artisansService.deleteArtisan(id);
  }

  /**
   * FACILITATOR: Get my referred artisans
   */
  @Get('facilitator/my-referrals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITATOR)
  async getMyReferrals(@Request() req): Promise<ArtisanResponseDto[]> {
    return this.artisansService.getArtisansByFacilitator(req.user.id);
  }

  /**
   * FACILITATOR: Get my referral statistics
   */
  @Get('facilitator/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITATOR)
  async getMyReferralStats(@Request() req) {
    return this.artisansService.getFacilitatorReferralStats(req.user.id);
  }

  /**
   * FACILITATOR: Get my referral link
   */
  @Get('facilitator/referral-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FACILITATOR)
  async getMyReferralLink(@Request() req) {
    const link = this.artisansService.generateReferralLink(req.user.id);
    return { referralLink: link };
  }

  /**
   * ADMIN: Get facilitator's referral link
   */
  @Get('admin/facilitator/:facilitatorId/referral-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getFacilitatorReferralLink(@Param('facilitatorId') facilitatorId: string) {
    const link = this.artisansService.generateReferralLink(facilitatorId);
    return { referralLink: link };
  }
}
