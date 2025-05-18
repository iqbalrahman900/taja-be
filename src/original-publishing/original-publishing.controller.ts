// original-publishing.controller.ts
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
  HttpStatus,
  HttpCode,
  Request
} from '@nestjs/common';
import { OriginalPublishingService } from './original-publishing.service';
import { CreateOriginalPublishingDto } from './dto/create-original-publishing.dto';
import { UpdateOriginalPublishingDto } from './dto/update-original-publishing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('original-publishing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OriginalPublishingController {
  constructor(private readonly originalPublishingService: OriginalPublishingService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createOriginalPublishingDto: CreateOriginalPublishingDto, @Request() req) {
    return this.originalPublishingService.create(createOriginalPublishingDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const query = search 
      ? { 
          $or: [
            { companyName: { $regex: search, $options: 'i' } },
            { officialEmail: { $regex: search, $options: 'i' } },
            { companyRegistrationNo: { $regex: search, $options: 'i' } },
            { tinNumber: { $regex: search, $options: 'i' } }, // Added TIN Number search
            { address: { $regex: search, $options: 'i' } },   // Added address search
            { picName: { $regex: search, $options: 'i' } },
            { picEmail: { $regex: search, $options: 'i' } }
          ] 
        } 
      : {};
      
    return this.originalPublishingService.findAll(+page, +limit, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.originalPublishingService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOriginalPublishingDto: UpdateOriginalPublishingDto) {
    return this.originalPublishingService.update(id, updateOriginalPublishingDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.originalPublishingService.remove(id);
  }

  @Get('registration/:regNo')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findByRegistrationNo(@Param('regNo') regNo: string) {
    return this.originalPublishingService.findByRegistrationNo(regNo);
  }
}