// src/catalogs/schemas/income.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IncomeDocument = Document & Income;

@Schema({ timestamps: true })
export class Income {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Catalog' })
  catalogId: Types.ObjectId;

  @Prop({ required: true })
  tapNumber: string;

  @Prop({ required: true, type: Number, min: 0 })
  amount: number;

  @Prop()
  source?: string; // e.g., "streaming", "licensing", etc.

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ default: false })
  royaltiesCalculated: boolean;

  @Prop({ default: false })
  paymentProcessed: boolean;

  @Prop({ type: Date })
  paymentDate?: Date;
}

export const IncomeSchema = SchemaFactory.createForClass(Income);