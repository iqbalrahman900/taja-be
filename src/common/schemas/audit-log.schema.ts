// src/common/schemas/audit-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  action: string; // CREATE, UPDATE, DELETE

  @Prop({ required: true })
  entityType: string; // Catalog, Contributor, etc.

  @Prop({ required: true })
  entityId: string;

  @Prop({ type: Object })
  changes: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);