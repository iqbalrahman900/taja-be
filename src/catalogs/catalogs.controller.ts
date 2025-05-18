// src/catalogs/catalogs.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { CreateContributorDto } from './dto/create-contributor.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CatalogType, CatalogStatus } from './schemas/catalog.schema';
import { ContributorRole } from './schemas/contributor.schema';
import { UpdateContributorDto } from './dto/update-contributor.dto';

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) { }

  // CATALOG ENDPOINTS
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createCatalogDto: CreateCatalogDto, @Request() req) {
    return this.catalogsService.create(createCatalogDto, req.user.id);
  }

  // Update the findAll method in catalogs.controller.ts

@Get()
findAll(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('search') search?: string,
  @Query('type') type?: CatalogType,
  @Query('status') status?: CatalogStatus,
  @Query('tagging') tagging?: string,
  @Query('includeCovers') includeCovers?: string, // Add query parameter
) {
  // Convert string to boolean if present
  const includeCoversBoolean = includeCovers === 'true';
  
  return this.catalogsService.findAll(
    page, 
    limit, 
    search, 
    type, 
    status, 
    tagging,
    includeCoversBoolean // Pass the boolean value
  );
}

  @Get('all-taggings')
  getAllTaggings() {
    return this.catalogsService.getAllTaggings();
  }

  @Get('popular-taggings')
  getPopularTaggings(@Query('limit') limit = 10) {
    return this.catalogsService.getPopularTaggings(+limit);
  }

  @Patch(':id/tagging')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCatalogTagging(
    @Param('id') id: string,
    @Body() { tagging }: { tagging: string }
  ) {
    return this.catalogsService.updateCatalogTagging(id, tagging);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogsService.findOne(id);
  }


  @Get('tap/:tapNumber/publisher/:publisherName')
  getPublisherTotals(
    @Param('tapNumber') tapNumber: string,
    @Param('publisherName') publisherName: string
  ) {
    return this.catalogsService.getPublisherTotals(tapNumber, publisherName);
  }

  @Get('tap/:tapNumber')
  findByTapNumber(@Param('tapNumber') tapNumber: string) {
    return this.catalogsService.findByTapNumber(tapNumber);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto) {
    return this.catalogsService.update(id, updateCatalogDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.catalogsService.remove(id);
  }

  @Delete(':id/hard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  hardRemove(@Param('id') id: string) {
    return this.catalogsService.hardRemove(id);
  }

  // CONTRIBUTOR ENDPOINTS
  @Post('contributor')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  addContributor(@Body() createContributorDto: CreateContributorDto) {
    return this.catalogsService.addContributor(createContributorDto);
  }

  @Get(':id/contributors')
  getContributors(
    @Param('id') id: string,
    @Query('role') role?: ContributorRole,
  ) {
    return this.catalogsService.getContributors(id, role);
  }

  @Get('tap/:tapNumber/contributors')
  getContributorsByTapNumber(
    @Param('tapNumber') tapNumber: string,
    @Query('role') role?: ContributorRole,
  ) {
    return this.catalogsService.getContributorsByTapNumber(tapNumber, role);
  }

  // DISTRIBUTION ENDPOINTS
  @Post('distribution')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  addDistribution(@Body() createDistributionDto: CreateDistributionDto) {
    return this.catalogsService.addDistribution(createDistributionDto);
  }

  @Get('tap/:tapNumber/distributions')
  getDistributions(@Param('tapNumber') tapNumber: string) {
    return this.catalogsService.getDistributions(tapNumber);
  }

  @Get('tap/:tapNumber/distribution/active')
  getActiveDistribution(@Param('tapNumber') tapNumber: string) {
    return this.catalogsService.getActiveDistribution(tapNumber);
  }

  // INCOME AND ROYALTY ENDPOINTS
  @Post('income')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  recordIncome(@Body() createIncomeDto: CreateIncomeDto) {
    return this.catalogsService.recordIncome(createIncomeDto);
  }

  @Get('tap/:tapNumber/incomes')
  getIncomes(
    @Param('tapNumber') tapNumber: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('paid') paid?: boolean,
  ) {
    return this.catalogsService.getIncomes(tapNumber, startDate, endDate, paid);
  }

  @Post('income/:id/calculate-royalties')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  calculateRoyalties(@Param('id') id: string) {
    return this.catalogsService.calculateRoyalties(id);
  }

  @Post('income/:id/process-payment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  processPayment(@Param('id') id: string) {
    return this.catalogsService.processPayment(id);
  }

  // FULL DETAILS ENDPOINT
  @Get('tap/:tapNumber/details')
  getCatalogFullDetails(@Param('tapNumber') tapNumber: string) {
    return this.catalogsService.getCatalogFullDetails(tapNumber);
  }

  @Get('stats/song-types')
  async getSongTypeCounts() {
    return this.catalogsService.getSongTypeCounts();
  }

  @Get('stats/status-counts')
  async getStatusCounts() {
    return this.catalogsService.getStatusCounts();
  }

  @Patch('contributor/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateContributor(
    @Param('id') id: string,
    @Body() updateContributorDto: UpdateContributorDto
  ) {
    return this.catalogsService.updateContributor(id, updateContributorDto);
  }


  @Get('tap/:tapNumber/covers')
  getCoversByParentTap(@Param('tapNumber') tapNumber: string) {
    return this.catalogsService.getCoversByParentTap(tapNumber);
  }


}