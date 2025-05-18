// src/catalogs/catalogs.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Catalog, CatalogDocument, CatalogType, CatalogStatus } from './schemas/catalog.schema';
import { Contributor, ContributorDocument, ContributorRole } from './schemas/contributor.schema';
import { Distribution, DistributionDocument } from './schemas/distribution.schema';
import { Income, IncomeDocument } from './schemas/income.schema';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { CreateContributorDto } from './dto/create-contributor.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateContributorDto } from './dto/update-contributor.dto';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
    @InjectModel(Contributor.name) private contributorModel: Model<ContributorDocument>,
    @InjectModel(Distribution.name) private distributionModel: Model<DistributionDocument>,
    @InjectModel(Income.name) private incomeModel: Model<IncomeDocument>,
  ) { }

  async generateTapNumber(): Promise<string> {
    // Generate a TAP Number in format: TAP-YYYY-XXXX-MY
    const year = new Date().getFullYear();

    // Find the highest existing TAP number for this year
    const regex = new RegExp(`^TAP-${year}-`);
    const latestCatalog = await this.catalogModel
      .findOne({ tapNumber: { $regex: regex } })
      .sort({ tapNumber: -1 })
      .exec();

    let sequentialNumber = '0001';
    if (latestCatalog) {
      // Extract the sequential part (XXXX) from TAP-YYYY-XXXX-MY
      const parts = latestCatalog.tapNumber.split('-');
      if (parts.length >= 3) {
        const lastSequence = parseInt(parts[2], 10);
        sequentialNumber = (lastSequence + 1).toString().padStart(4, '0');
      }
    }

    return `TAP-${year}-${sequentialNumber}-MY`;
  }

  // src/catalogs/catalogs.service.ts - Updated create method

async create(createCatalogDto: CreateCatalogDto, userId: string): Promise<Catalog> {
  // If TAP number is not provided, generate one
  if (!createCatalogDto.tapNumber) {
    createCatalogDto.tapNumber = await this.generateTapNumber();
  } else {
    // Check if the TAP number already exists
    const existingCatalog = await this.catalogModel.findOne({
      tapNumber: createCatalogDto.tapNumber
    }).exec();

    if (existingCatalog) {
      throw new ConflictException(`Catalog with TAP number ${createCatalogDto.tapNumber} already exists`);
    }
  }

  // Set default dateIn to current date if not provided
  if (!createCatalogDto.dateIn) {
    createCatalogDto.dateIn = new Date();
  }

  // If it's a derivative work (remix, cover), validate parent TAP number
  if (createCatalogDto.parentTapNumber) {
    const parentCatalog = await this.catalogModel.findOne({
      tapNumber: createCatalogDto.parentTapNumber
    }).exec();

    if (!parentCatalog) {
      throw new NotFoundException(`Parent catalog with TAP number ${createCatalogDto.parentTapNumber} not found`);
    }
  }

  // Handle country cover data
  if (createCatalogDto.selectedCountries && createCatalogDto.selectedCountries.length > 0) {
    // Ensure countrycover matches the selectedCountries array length
    createCatalogDto.countrycover = createCatalogDto.selectedCountries.length;
  } else if (!createCatalogDto.countrycover) {
    // Set to 0 if not provided
    createCatalogDto.countrycover = 0;
  }

  // Always set status to PENDING when creating a new catalog
  const newCatalog = new this.catalogModel({
    ...createCatalogDto,
    status: CatalogStatus.PENDING, // Set default status to PENDING
    createdBy: userId,
  });

  return newCatalog.save();
}

  async addContributor(createContributorDto: CreateContributorDto): Promise<Contributor> {
    // Validate if catalog exists
    const catalog = await this.catalogModel.findById(createContributorDto.catalogId).exec();
    if (!catalog) {
      throw new NotFoundException(`Catalog with ID ${createContributorDto.catalogId} not found`);
    }

    // Ensure the TAP number matches
    if (catalog.tapNumber !== createContributorDto.tapNumber) {
      throw new ConflictException('TAP number mismatch');
    }

    // Verify that adding this contributor won't exceed 100% total royalty
    const existingContributors = await this.contributorModel.find({
      tapNumber: createContributorDto.tapNumber,
      role: createContributorDto.role
    }).exec();

    const currentTotalPercentage = existingContributors.reduce(
      (sum, contributor) => sum + contributor.royaltyPercentage, 0
    );

    if (currentTotalPercentage + createContributorDto.royaltyPercentage > 100) {
      throw new BadRequestException(
        `Adding this contributor would exceed 100% royalty for role ${createContributorDto.role}. ` +
        `Current total: ${currentTotalPercentage}%, Trying to add: ${createContributorDto.royaltyPercentage}%`
      );
    }

    const newContributor = new this.contributorModel(createContributorDto);
    return newContributor.save();
  }

  async addDistribution(createDistributionDto: CreateDistributionDto): Promise<Distribution> {
    // Validate if catalog exists
    const catalog = await this.catalogModel.findById(createDistributionDto.catalogId).exec();
    if (!catalog) {
      throw new NotFoundException(`Catalog with ID ${createDistributionDto.catalogId} not found`);
    }

    // Ensure the TAP number matches
    if (catalog.tapNumber !== createDistributionDto.tapNumber) {
      throw new ConflictException('TAP number mismatch');
    }

    // If there's an active distribution, deactivate it
    if (createDistributionDto.startDate) {
      await this.distributionModel.updateMany(
        {
          tapNumber: createDistributionDto.tapNumber,
          isActive: true,
          endDate: { $exists: false }
        },
        {
          isActive: false,
          endDate: createDistributionDto.startDate
        }
      ).exec();
    }

    const newDistribution = new this.distributionModel(createDistributionDto);
    return newDistribution.save();
  }

  async recordIncome(createIncomeDto: CreateIncomeDto): Promise<Income> {
    // Validate if catalog exists
    const catalog = await this.catalogModel.findById(createIncomeDto.catalogId).exec();
    if (!catalog) {
      throw new NotFoundException(`Catalog with ID ${createIncomeDto.catalogId} not found`);
    }

    // Ensure the TAP number matches
    if (catalog.tapNumber !== createIncomeDto.tapNumber) {
      throw new ConflictException('TAP number mismatch');
    }

    // Update the total revenue in the catalog
    await this.catalogModel.findByIdAndUpdate(
      createIncomeDto.catalogId,
      { $inc: { totalRevenue: createIncomeDto.amount } }
    ).exec();

    const newIncome = new this.incomeModel(createIncomeDto);
    return newIncome.save();
  }

  async calculateRoyalties(incomeId: string): Promise<any> {
    const income = await this.incomeModel.findById(incomeId).exec();
    if (!income) {
      throw new NotFoundException(`Income record with ID ${incomeId} not found`);
    }

    if (income.royaltiesCalculated) {
      throw new ConflictException('Royalties for this income have already been calculated');
    }

    // Get all contributors for the catalog
    const contributors = await this.contributorModel.find({
      tapNumber: income.tapNumber
    }).exec();

    if (contributors.length === 0) {
      throw new BadRequestException(`No contributors found for TAP number ${income.tapNumber}`);
    }

    // Calculate royalties for each contributor
    const royaltyCalculations = contributors.map(contributor => {
      const royaltyAmount = (income.amount * contributor.royaltyPercentage) / 100;

      return {
        contributorId: contributor._id,
        contributorName: contributor.name,
        role: contributor.role,
        percentage: contributor.royaltyPercentage,
        amount: royaltyAmount,
        manager: contributor.manager,
        publisherName: contributor.publisherName,
        publisherType: contributor.publisherType,
        publisherPercentage: contributor.publisherPercentage,
        subPublisherName: contributor.subPublisherName,
        subPublisherPercentage: contributor.subPublisherPercentage
      };
    });

    // Mark the income as having royalties calculated
    await this.incomeModel.findByIdAndUpdate(
      incomeId,
      { royaltiesCalculated: true }
    ).exec();

    return {
      incomeId: income._id,
      tapNumber: income.tapNumber,
      totalAmount: income.amount,
      date: income.date,
      royalties: royaltyCalculations
    };
  }

  async processPayment(incomeId: string): Promise<any> {
    const income = await this.incomeModel.findById(incomeId).exec();
    if (!income) {
      throw new NotFoundException(`Income record with ID ${incomeId} not found`);
    }

    if (!income.royaltiesCalculated) {
      throw new BadRequestException('Royalties must be calculated before processing payment');
    }

    if (income.paymentProcessed) {
      throw new ConflictException('Payment for this income has already been processed');
    }

    // Mark the income as paid
    const paymentDate = new Date();
    await this.incomeModel.findByIdAndUpdate(
      incomeId,
      {
        paymentProcessed: true,
        paymentDate: paymentDate
      }
    ).exec();

    // Return the payment details (we would recalculate royalties here in a real system)
    const royaltyDetails = await this.calculateRoyalties(incomeId);

    return {
      ...royaltyDetails,
      paymentDate: paymentDate,
      paymentStatus: 'Processed'
    };
  }

  // Update the findAll method in catalogs.service.ts

async findAll(
  page: number = 1,
  limit: number = 10,
  search?: string,
  type?: CatalogType,
  status?: CatalogStatus,
  tagging?: string,
  includeCovers?: boolean // Add optional parameter to control cover inclusion
): Promise<{ data: Catalog[]; total: number; page: number; limit: number }> {
  console.log('Service received params:', {
    page,
    limit,
    search,
    type,
    status,
    tagging,
    includeCovers,
    tagTypeOf: typeof tagging,
    tagLength: tagging?.length
  });
  
  const skip = (page - 1) * limit;
  let query: any = {};

  if (search) {
    query.$or = [
      { tapNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (tagging && tagging.trim() !== '') {
    query.tagging = { $regex: tagging.trim(), $options: 'i' };
  }

  // Exclude covers by default unless explicitly requested
  if (!includeCovers) {
    query.versionType = { $ne: 'cover' };
  }

  const [data, total] = await Promise.all([
    this.catalogModel.find(query).skip(skip).limit(limit).sort({ dateIn: -1 }).exec(),
    this.catalogModel.countDocuments(query).exec(),
  ]);

  return {
    data,
    total,
    page,
    limit,
  };
}

  async getAllTaggings(): Promise<string[]> {
    const allTaggings = await this.catalogModel.distinct('tagging');
    return allTaggings.filter(tag => tag).sort(); // Filter out empty strings
  }
  
  // Update catalog tagging
  async updateCatalogTagging(catalogId: string, tagging: string): Promise<Catalog> {
    const updatedCatalog = await this.catalogModel.findByIdAndUpdate(
      catalogId,
      { $set: { tagging } },
      { new: true }
    ).exec();
  
    if (!updatedCatalog) {
      throw new NotFoundException(`Catalog with ID ${catalogId} not found`);
    }
  
    return updatedCatalog;
  }
  
  // Get popular tagging values
  async getPopularTaggings(limit: number = 10): Promise<{
    tagging: string;
    count: number;
  }[]> {
    const popularTaggings = await this.catalogModel.aggregate([
      { $match: { tagging: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$tagging',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          tagging: '$_id',
          count: 1
        }
      }
    ]);
  
    return popularTaggings;
  }

  async findOne(id: string): Promise<Catalog> {
    const catalog = await this.catalogModel.findById(id).exec();
    if (!catalog) {
      throw new NotFoundException(`Catalog with ID ${id} not found`);
    }
    return catalog;
  }

  async findByTapNumber(tapNumber: string): Promise<Catalog> {
    const catalog = await this.catalogModel.findOne({ tapNumber }).exec();
    if (!catalog) {
      throw new NotFoundException(`Catalog with TAP number ${tapNumber} not found`);
    }
    return catalog;
  }

  async update(id: string, updateCatalogDto: UpdateCatalogDto): Promise<Catalog> {
    // Don't allow changing the TAP number
    if (updateCatalogDto.tapNumber) {
      delete updateCatalogDto.tapNumber;
    }

    const updatedCatalog = await this.catalogModel.findByIdAndUpdate(
      id,
      { $set: updateCatalogDto },
      { new: true },
    ).exec();

    if (!updatedCatalog) {
      throw new NotFoundException(`Catalog with ID ${id} not found`);
    }

    return updatedCatalog;
  }

  async remove(id: string): Promise<void> {
    const catalog = await this.catalogModel.findById(id).exec();
    if (!catalog) {
      throw new NotFoundException(`Catalog with ID ${id} not found`);
    }

    // Instead of marking as inactive directly, set status to INACTIVE and dateOut
    await this.catalogModel.findByIdAndUpdate(
      id,
      {
        status: CatalogStatus.INACTIVE,
        dateOut: new Date()
      }
    ).exec();
  }

  async hardRemove(id: string): Promise<void> {
    const result = await this.catalogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Catalog with ID ${id} not found`);
    }

    // Also delete all related records
    await Promise.all([
      this.contributorModel.deleteMany({ catalogId: new Types.ObjectId(id) }).exec(),
      this.distributionModel.deleteMany({ catalogId: new Types.ObjectId(id) }).exec(),
      this.incomeModel.deleteMany({ catalogId: new Types.ObjectId(id) }).exec(),
    ]);
  }

  async getContributors(
    catalogId: string,
    role?: ContributorRole,
  ): Promise<Contributor[]> {
    let query: any = { catalogId: new Types.ObjectId(catalogId) };

    if (role) {
      query.role = role;
    }

    return this.contributorModel.find(query).exec();
  }

  async getContributorsByTapNumber(
    tapNumber: string,
    role?: ContributorRole,
  ): Promise<Contributor[]> {
    let query: any = { tapNumber };

    if (role) {
      query.role = role;
    }

    return this.contributorModel.find(query).exec();
  }

  async getDistributions(tapNumber: string): Promise<Distribution[]> {
    return this.distributionModel.find({ tapNumber }).sort({ startDate: -1 }).exec();
  }

  async getActiveDistribution(tapNumber: string): Promise<Distribution | null> {
    return this.distributionModel.findOne({
      tapNumber,
      isActive: true
    }).exec();
  }

  async getIncomes(
    tapNumber: string,
    startDate?: Date,
    endDate?: Date,
    paid?: boolean
  ): Promise<Income[]> {
    let query: any = { tapNumber };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    if (paid !== undefined) {
      query.paymentProcessed = paid;
    }

    return this.incomeModel.find(query).sort({ date: -1 }).exec();
  }

  // async getCatalogFullDetails(tapNumber: string): Promise<any> {
  //   const catalog = await this.findByTapNumber(tapNumber);
  //   const contributors = await this.getContributorsByTapNumber(tapNumber);
  //   const distributions = await this.getDistributions(tapNumber);
  //   const incomes = await this.getIncomes(tapNumber);

  //   // Group contributors by role
  //   const groupedContributors = contributors.reduce((groups, contributor) => {
  //     const role = contributor.role;
  //     if (!groups[role]) {
  //       groups[role] = [];
  //     }
  //     groups[role].push(contributor);
  //     return groups;
  //   }, {});

  //   // Calculate total royalty percentages for each role, ensuring they add up to 100%
  //   const royaltyTotals = {};
  //   Object.keys(groupedContributors).forEach(role => {
  //     // Just sum the royalty percentages from contributors with this role
  //     royaltyTotals[role] = groupedContributors[role].reduce(
  //       (sum, contributor) => sum + contributor.royaltyPercentage, 0
  //     );
  //   });

  //   // Normalize or manually set to 100% if needed
  //   // This is a safety check to ensure the total is 100% for display purposes
  //   if (Object.keys(royaltyTotals).length === 1) {
  //     const role = Object.keys(royaltyTotals)[0];
  //     royaltyTotals[role] = 100; // Set to 100% if there's only one role
  //   }

  //   const activeDistribution = distributions.find(d => d.isActive);

  //   return {
  //     catalog,
  //     contributors: groupedContributors,
  //     royaltyTotals,
  //     distributions,
  //     activeDistribution,
  //     incomes,
  //     totalRevenue: catalog.totalRevenue,
  //   };
  // }

  async getSongTypeCounts(): Promise<any> {
    try {
      // Use MongoDB aggregation to count documents by song type
      const songTypeCounts = await this.catalogModel.aggregate([
        {
          $group: {
            _id: '$songType',
            count: { $sum: 1 }
          }
        }
      ]).exec();

      // Transform aggregation results into a more usable format
      const result = {
        commercial: 0,
        jingles: 0,
        scoring: 0,
        montage: 0
      };

      // Map the aggregation results to the appropriate keys
      songTypeCounts.forEach((item: any) => {
        if (item._id === 'commercial') {
          result.commercial = item.count;
        } else if (item._id === 'jingles') {
          result.jingles = item.count;
        } else if (item._id === 'scoring') {
          result.scoring = item.count;
        }
        else if (item._id === 'montage') {
          result.montage = item.count;
        }

      });

      return result;
    } catch (error) {
      console.error('Error getting song type counts:', error);
      throw error;
    }
  }


  async getStatusCounts(): Promise<any> {
    try {
      // Use MongoDB aggregation to count documents by status
      const statusCounts = await this.catalogModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).exec();

      // Transform aggregation results into a more usable format
      const result = {
        pending: 0,
        active: 0,
        inactive: 0,
        conflict: 0,
      };

      // Map the aggregation results to the appropriate keys
      statusCounts.forEach((item: any) => {
        if (item._id === 'pending') {
          result.pending = item.count;
        } else if (item._id === 'active') {
          result.active = item.count;
        } else if (item._id === 'inactive') {
          result.inactive = item.count;

        }else if (item._id === 'conflict') {
          result.conflict = item.count;
          
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting status counts:', error);
      throw error;
    }
  }


  async getPublisherTotals(tapNumber: string, publisherName: string): Promise<any> {
    // Get all contributors for this TAP number
    const contributors = await this.getContributorsByTapNumber(tapNumber);

    // Filter contributors by the publisher name (either as publisher or sub-publisher)
    const relevantContributors = contributors.filter(contributor =>
      contributor.publisherName === publisherName ||
      contributor.subPublisherName === publisherName
    );

    if (relevantContributors.length === 0) {
      return {
        publisherName,
        contributorsCount: 0,
        totalRoyaltyPercentage: 0,
        totalPublisherPercentage: 0,
        totalSubPublisherPercentage: 0,
        grandTotal: 0
      };
    }

    // Calculate totals
    // Calculate totals
    const result = relevantContributors.reduce((totals, contributor) => {
      // Add contributor royalty percentage
      totals.totalRoyaltyPercentage += contributor.royaltyPercentage || 0;

      // Add publisher percentage if this is the publisher
      if (contributor.publisherName === publisherName) {
        totals.totalPublisherPercentage += contributor.publisherPercentage || 0;
      }

      // Add sub-publisher percentage if this is the sub-publisher
      if (contributor.subPublisherName === publisherName) {
        totals.totalSubPublisherPercentage += contributor.subPublisherPercentage || 0;
      }

      return totals;
    }, {
      publisherName,
      contributorsCount: relevantContributors.length,
      totalRoyaltyPercentage: 0,
      totalPublisherPercentage: 0,
      totalSubPublisherPercentage: 0,
      grandTotal: 0  // Initialize grandTotal property here
    });

    // Calculate grand total
    result.grandTotal = result.totalRoyaltyPercentage +
      result.totalPublisherPercentage +
      result.totalSubPublisherPercentage;

    return result;
  }

  async updateContributor(id: string, updateContributorDto: UpdateContributorDto): Promise<Contributor> {
    // Check if the contributor exists
    const contributor = await this.contributorModel.findById(id).exec();
    if (!contributor) {
      throw new NotFoundException(`Contributor with ID ${id} not found`);
    }

    // Now TypeScript knows contributor is not null, so the rest of your code remains the same
    // If royaltyPercentage is being updated, check that it doesn't exceed 100% total
    if (updateContributorDto.royaltyPercentage !== undefined &&
      updateContributorDto.royaltyPercentage !== contributor.royaltyPercentage) {

      // Find all other contributors with the same role and TAP number
      const otherContributors = await this.contributorModel.find({
        tapNumber: contributor.tapNumber,
        role: contributor.role,
        _id: { $ne: new Types.ObjectId(id) } // Exclude current contributor
      }).exec();

      // Calculate current total percentage excluding this contributor
      const currentTotalPercentage = otherContributors.reduce(
        (sum, contr) => sum + contr.royaltyPercentage, 0
      );

      // Check if new percentage would exceed 100%
      if (currentTotalPercentage + updateContributorDto.royaltyPercentage > 100) {
        throw new BadRequestException(
          `Updating this contributor would exceed 100% royalty for role ${contributor.role}. ` +
          `Current total (excluding this contributor): ${currentTotalPercentage}%, ` +
          `New percentage: ${updateContributorDto.royaltyPercentage}%`
        );
      }
    }

    // Update the contributor
    const updatedContributor = await this.contributorModel.findByIdAndUpdate(
      id,
      { $set: updateContributorDto },
      { new: true }
    ).exec();

    if (!updatedContributor) {
      throw new NotFoundException(`Contributor with ID ${id} not found after update`);
    }

    return updatedContributor;
  }

  // Add this method to catalogs.service.ts

async getCoversByParentTap(parentTapNumber: string): Promise<Catalog[]> {
  // First, validate if the parent catalog exists
  const parentCatalog = await this.catalogModel.findOne({ 
    tapNumber: parentTapNumber 
  }).exec();
  
  if (!parentCatalog) {
    throw new NotFoundException(`Parent catalog with TAP number ${parentTapNumber} not found`);
  }

  // Find all catalogs where parentTapNumber matches and versionType is 'cover'
  const covers = await this.catalogModel.find({
    parentTapNumber: parentTapNumber,
    versionType: 'cover'
  }).sort({ dateIn: -1 }).exec();

  return covers;
}

// Update the getCatalogFullDetails method to include covers
async getCatalogFullDetails(tapNumber: string): Promise<any> {
  const catalog = await this.findByTapNumber(tapNumber);
  const contributors = await this.getContributorsByTapNumber(tapNumber);
  const distributions = await this.getDistributions(tapNumber);
  const incomes = await this.getIncomes(tapNumber);
  
  // Add covers to the response
  const covers = await this.getCoversByParentTap(tapNumber);

  // Group contributors by role
  const groupedContributors = contributors.reduce((groups, contributor) => {
    const role = contributor.role;
    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role].push(contributor);
    return groups;
  }, {});

  // Calculate total royalty percentages for each role, ensuring they add up to 100%
  const royaltyTotals = {};
  Object.keys(groupedContributors).forEach(role => {
    // Just sum the royalty percentages from contributors with this role
    royaltyTotals[role] = groupedContributors[role].reduce(
      (sum, contributor) => sum + contributor.royaltyPercentage, 0
    );
  });

  // Normalize or manually set to 100% if needed
  // This is a safety check to ensure the total is 100% for display purposes
  if (Object.keys(royaltyTotals).length === 1) {
    const role = Object.keys(royaltyTotals)[0];
    royaltyTotals[role] = 100; // Set to 100% if there's only one role
  }

  const activeDistribution = distributions.find(d => d.isActive);

  return {
    catalog,
    contributors: groupedContributors,
    royaltyTotals,
    distributions,
    activeDistribution,
    incomes,
    totalRevenue: catalog.totalRevenue,
    covers, // Add covers to the response
  };
}
}