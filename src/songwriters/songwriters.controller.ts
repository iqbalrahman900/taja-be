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
import { SongwritersService } from './songwriters.service';
import { CreateSongwriterDto } from './dto/create-songwriter.dto';
import { UpdateSongwriterDto } from './dto/update-songwriter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

@Controller('songwriters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SongwritersController {
  constructor(private readonly songwritersService: SongwritersService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createSongwriterDto: CreateSongwriterDto, @Request() req) {
    return this.songwritersService.create(createSongwriterDto, req.user.id);
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
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { icNumber: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          { tinNumber: { $regex: search, $options: 'i' } },
          { 'penNames.name': { $regex: search, $options: 'i' } }
        ]
      }
      : {};

    return this.songwritersService.findAll(+page, +limit, query);
  }

  // These specific routes MUST be placed BEFORE the :id route
  @Get('upcoming-birthdays')
  @Roles(UserRole.ADMIN, UserRole.USER)
  getUpcomingBirthdays() {
    return this.songwritersService.getUpcomingBirthdays();
  }

  @Get('expiring-contracts')
  @Roles(UserRole.ADMIN, UserRole.USER)
  getExpiringContracts() {
    return this.songwritersService.getExpiringContracts();
  }

  // Generic ID route comes AFTER the specific routes
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.songwritersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateSongwriterDto: UpdateSongwriterDto) {
    return this.songwritersService.update(id, updateSongwriterDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.songwritersService.remove(id);
  }

  @Post(':id/pen-names')
  @Roles(UserRole.ADMIN)
  addPenName(
    @Param('id') id: string,
    @Body() penNameDto: { name: string },
  ) {
    return this.songwritersService.addPenName(id, penNameDto);
  }

  @Delete(':id/pen-names/:penNameId')
  @Roles(UserRole.ADMIN)
  removePenName(
    @Param('id') id: string,
    @Param('penNameId') penNameId: string,
  ) {
    return this.songwritersService.removePenName(id, penNameId);
  }
}