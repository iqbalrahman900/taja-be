// src/common/schemas/audit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface AuditDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Audit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  action: string; // CREATE, UPDATE, DELETE, VIEW

  @Prop({ required: true })
  entityType: string; // Catalog, User, etc.

  @Prop({ required: true })
  entityId: string;

  @Prop({ type: Object })
  changes?: Record<string, any>; // What was changed

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional context

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);