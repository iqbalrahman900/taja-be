// src/common/services/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';

export interface AuditLogData {
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(logData: AuditLogData): Promise<void> {
    try {
      const auditLog = new this.auditLogModel(logData);
      await auditLog.save();
    } catch (error) {
      // Don't throw error to avoid breaking main operations
      console.error('Failed to save audit log:', error);
    }
  }

  async getAuditLogs(filters: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const { entityType, entityId, userId, action, limit = 50, page = 1 } = filters;
    
    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (userId) query.userId = userId;
    if (action) query.action = action;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async getCatalogAuditHistory(catalogId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ 
        entityType: 'Catalog',
        entityId: catalogId 
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}