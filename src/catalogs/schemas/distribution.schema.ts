// src/catalogs/schemas/distribution.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DistributionDocument = Document & Distribution;

@Schema({ timestamps: true })
export class Distribution {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Catalog' })
  catalogId: Types.ObjectId;

  @Prop({ required: true })
  tapNumber: string;

  @Prop({ required: true })
  distributor: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const DistributionSchema = SchemaFactory.createForClass(Distribution);