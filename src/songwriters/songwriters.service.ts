import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Songwriter, SongwriterDocument } from './schemas/songwriter.schema';
import { CreateSongwriterDto } from './dto/create-songwriter.dto';
import { UpdateSongwriterDto } from './dto/update-songwriter.dto';

@Injectable()
export class SongwritersService {
  constructor(
    @InjectModel(Songwriter.name)
    private songwriterModel: Model<SongwriterDocument>,
  ) {}

  async create(createSongwriterDto: CreateSongwriterDto, userId: string): Promise<Songwriter> {
    // Explicitly extract all fields including icNumber
    const {
      name,
      contactNumber,
      email,
      icNumber, 
      address,    // Extract the new address field
      macp,       // Extract the new MACP field
      tinNumber,  // Extract the new TIN Number field
      dateOfBirth,
      penNames,
      contract,
      deal,
      heir
    } = createSongwriterDto;

    // Create a new songwriter with all fields explicitly set
    const newSongwriter = new this.songwriterModel({
      name,
      contactNumber,
      email,
      icNumber,  // Make sure to set this explicitly
      address,    // Include the new address field
      macp,       // Include the new MACP field
      tinNumber,  // Include the new TIN Number field
      dateOfBirth,
      penNames,
      contract,
      deal,
      heir,
      createdBy: userId,
    });
    
    return newSongwriter.save();
  }

  async findAll(page = 1, limit = 10, query = {}): Promise<{ data: Songwriter[]; total: number }> {
    const skip = (page - 1) * limit;
    const data = await this.songwriterModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const total = await this.songwriterModel.countDocuments(query).exec();
    
    return { data, total };
  }

  async findOne(id: string): Promise<Songwriter> {
    const songwriter = await this.songwriterModel.findById(id).exec();
    if (!songwriter) {
      throw new NotFoundException(`Songwriter with ID ${id} not found`);
    }
    return songwriter;
  }

  async update(id: string, updateSongwriterDto: UpdateSongwriterDto): Promise<Songwriter> {
    const updatedSongwriter = await this.songwriterModel
      .findByIdAndUpdate(id, updateSongwriterDto, { new: true })
      .exec();
    
    if (!updatedSongwriter) {
      throw new NotFoundException(`Songwriter with ID ${id} not found`);
    }
    
    return updatedSongwriter;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.songwriterModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Songwriter with ID ${id} not found`);
    }
    return { deleted: true };
  }

  async addPenName(id: string, penName: { name: string }): Promise<Songwriter> {
    const songwriter = await this.songwriterModel.findById(id).exec();
    if (!songwriter) {
      throw new NotFoundException(`Songwriter with ID ${id} not found`);
    }
    
    songwriter.penNames.push({
      name: penName.name,
      isActive: true,
    });
    
    return songwriter.save();
  }

  async removePenName(id: string, penNameId: string): Promise<Songwriter> {
    // Using MongoDB $pull operator (cleaner approach)
    const updatedSongwriter = await this.songwriterModel.findByIdAndUpdate(
      id,
      { $pull: { penNames: { _id: penNameId } } },
      { new: true }
    ).exec();
    
    if (!updatedSongwriter) {
      throw new NotFoundException(`Songwriter with ID ${id} not found`);
    }
    
    return updatedSongwriter;
  }

  async getUpcomingBirthdays(): Promise<Songwriter[]> {
    // Get current date
    const today = new Date();
    
    // Calculate date one week from now
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    // Find songwriters with birthdays in the next 7 days
    // This query is more complex because we need to match based on month and day, not the year
    const songwriters = await this.songwriterModel.aggregate([
      {
        $addFields: {
          // Extract month and day from dateOfBirth
          birthMonth: { $month: "$dateOfBirth" },
          birthDay: { $dayOfMonth: "$dateOfBirth" },
          // Current month and day
          currentMonth: { $month: today },
          currentDay: { $dayOfMonth: today },
          // Next week's month and day
          nextWeekMonth: { $month: oneWeekFromNow },
          nextWeekDay: { $dayOfMonth: oneWeekFromNow }
        }
      },
      {
        $match: {
          $expr: {
            $or: [
              // If current month and next week's month are the same
              {
                $and: [
                  { $eq: ["$currentMonth", "$nextWeekMonth"] },
                  { $gte: ["$birthMonth", "$currentMonth"] },
                  { $eq: ["$birthMonth", "$currentMonth"] },
                  { $gte: ["$birthDay", "$currentDay"] },
                  { $lte: ["$birthDay", "$nextWeekDay"] }
                ]
              },
              // If we're spanning across months
              {
                $and: [
                  { $ne: ["$currentMonth", "$nextWeekMonth"] },
                  {
                    $or: [
                      // Either in current month with day >= current day
                      {
                        $and: [
                          { $eq: ["$birthMonth", "$currentMonth"] },
                          { $gte: ["$birthDay", "$currentDay"] }
                        ]
                      },
                      // Or in next week's month with day <= next week's day
                      {
                        $and: [
                          { $eq: ["$birthMonth", "$nextWeekMonth"] },
                          { $lte: ["$birthDay", "$nextWeekDay"] }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          birthMonth: 0,
          birthDay: 0,
          currentMonth: 0,
          currentDay: 0,
          nextWeekMonth: 0,
          nextWeekDay: 0
        }
      }
    ]).exec();
  
    return songwriters;
  }

  async getExpiringContracts(): Promise<Songwriter[]> {
    // Get current date
    const today = new Date();
    
    // Calculate date one month from now
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    
    // Find songwriters with contracts expiring in the next month
    const query = {
      'contract': { $exists: true },
      'contract.isActive': true,
      'contract.endDate': { 
        $exists: true,
        $ne: null,
        $gte: today,
        $lte: oneMonthFromNow 
      }
    };
    
    const data = await this.songwriterModel.find(query)
      .sort({ 'contract.endDate': 1 }) // Sort by closest end date first
      .exec();
    
    return data;
  }
}