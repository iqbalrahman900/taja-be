import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaggingSong, TaggingSongDocument } from './schemas/tagging-song.schema';
import { CreateTaggingSongDto } from './dto/create-tagging-song.dto';
import { UpdateTaggingSongDto } from './dto/update-tagging-song.dto';

@Injectable()
export class TaggingSongsService {
  constructor(
    @InjectModel(TaggingSong.name)
    private readonly taggingSongModel: Model<TaggingSongDocument>,
  ) {}

  async create(createTaggingSongDto: CreateTaggingSongDto): Promise<TaggingSong> {
    const newTaggingSong = new this.taggingSongModel(createTaggingSongDto);
    return newTaggingSong.save();
  }

  async findAll(page: number, limit: number, query = {}): Promise<{ 
    data: TaggingSong[]; 
    total: number; 
    page: number; 
    limit: number; 
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.taggingSongModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ categoryName: 1 })
        .exec(),
      this.taggingSongModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TaggingSong> {
    const taggingSong = await this.taggingSongModel.findById(id).exec();
    if (!taggingSong) {
      throw new NotFoundException(`Tagging song with ID ${id} not found`);
    }
    return taggingSong;
  }

  async findByName(categoryName: string): Promise<TaggingSong[]> {
    return this.taggingSongModel
      .find({ categoryName: { $regex: new RegExp(categoryName, 'i') } })
      .exec();
  }

  async update(id: string, updateTaggingSongDto: UpdateTaggingSongDto): Promise<TaggingSong> {
    const updatedTaggingSong = await this.taggingSongModel
      .findByIdAndUpdate(id, updateTaggingSongDto, { new: true })
      .exec();
    
    if (!updatedTaggingSong) {
      throw new NotFoundException(`Tagging song with ID ${id} not found`);
    }
    
    return updatedTaggingSong;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taggingSongModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Tagging song with ID ${id} not found`);
    }
  }

  async findActiveCategories(): Promise<TaggingSong[]> {
    return this.taggingSongModel.find({ isActive: true }).sort({ categoryName: 1 }).exec();
  }
}