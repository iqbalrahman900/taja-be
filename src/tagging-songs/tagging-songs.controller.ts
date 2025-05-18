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
  import { TaggingSongsService } from './tagging-songs.service';
  import { CreateTaggingSongDto } from './dto/create-tagging-song.dto';
  import { UpdateTaggingSongDto } from './dto/update-tagging-song.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from 'src/users/schemas/user.schema';
  
  @Controller('tagging-songs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class TaggingSongsController {
    constructor(private readonly taggingSongsService: TaggingSongsService) {}
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() createTaggingSongDto: CreateTaggingSongDto, @Request() req) {
      return this.taggingSongsService.create(createTaggingSongDto);
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
            categoryName: { $regex: search, $options: 'i' }
          } 
        : {};
        
      return this.taggingSongsService.findAll(+page, +limit, query);
    }
  
    @Get('active')
    @Roles(UserRole.ADMIN, UserRole.USER)
    findActiveCategories() {
      return this.taggingSongsService.findActiveCategories();
    }
  
    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.USER)
    findOne(@Param('id') id: string) {
      return this.taggingSongsService.findOne(id);
    }
  
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateTaggingSongDto: UpdateTaggingSongDto) {
      return this.taggingSongsService.update(id, updateTaggingSongDto);
    }
  
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
      return this.taggingSongsService.remove(id);
    }
  }