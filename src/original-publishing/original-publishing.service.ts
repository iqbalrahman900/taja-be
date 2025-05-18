import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OriginalPublishing, OriginalPublishingDocument } from './schemas/original-publishing.schema';
import { CreateOriginalPublishingDto } from './dto/create-original-publishing.dto';
import { UpdateOriginalPublishingDto } from './dto/update-original-publishing.dto';

@Injectable()
export class OriginalPublishingService {
  constructor(
    @InjectModel(OriginalPublishing.name)
    private readonly originalPublishingModel: Model<OriginalPublishingDocument>,
  ) {}

  async create(createOriginalPublishingDto: CreateOriginalPublishingDto): Promise<OriginalPublishing> {
    const newOriginalPublishing = new this.originalPublishingModel(createOriginalPublishingDto);
    return newOriginalPublishing.save();
  }

  async findAll(page: number, limit: number, query = {}): Promise<{ 
    data: OriginalPublishing[]; 
    total: number; 
    page: number; 
    limit: number; 
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.originalPublishingModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.originalPublishingModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<OriginalPublishing> {
    const originalPublishing = await this.originalPublishingModel.findById(id).exec();
    if (!originalPublishing) {
      throw new NotFoundException(`Original Publishing with ID ${id} not found`);
    }
    return originalPublishing;
  }

  async update(id: string, updateOriginalPublishingDto: UpdateOriginalPublishingDto): Promise<OriginalPublishing> {
    const updatedOriginalPublishing = await this.originalPublishingModel
      .findByIdAndUpdate(id, updateOriginalPublishingDto, { new: true })
      .exec();
    
    if (!updatedOriginalPublishing) {
      throw new NotFoundException(`Original Publishing with ID ${id} not found`);
    }
    
    return updatedOriginalPublishing;
  }

  async remove(id: string): Promise<void> {
    const result = await this.originalPublishingModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Original Publishing with ID ${id} not found`);
    }
  }

  async findByRegistrationNo(companyRegistrationNo: string): Promise<OriginalPublishing> {
    const originalPublishing = await this.originalPublishingModel
      .findOne({ companyRegistrationNo })
      .exec();
    
    if (!originalPublishing) {
      throw new NotFoundException(`Original Publishing with registration number ${companyRegistrationNo} not found`);
    }
    
    return originalPublishing;
  }
}