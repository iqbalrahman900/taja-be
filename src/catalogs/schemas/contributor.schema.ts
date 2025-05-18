// src/catalogs/schemas/contributor.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ContributorRole {
  COMPOSER = 'C',
  AUTHOR = 'A',
  COMPOSER_AUTHOR = 'CA',
  ARRANGER = 'AR',
}

export enum PublisherType {
  ORIGINAL = 'OP',
  SUB = 'SP',
}

export type ContributorDocument = Document & Contributor;

@Schema({ timestamps: true })
export class Contributor {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Catalog' })
  catalogId: Types.ObjectId;

  @Prop({ required: true })
  tapNumber: string; // For quick querying without joins

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ContributorRole })
  role: ContributorRole;

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  royaltyPercentage: number;

  @Prop()
  manager?: string;

  @Prop({ enum: PublisherType })
  publisherType?: PublisherType;

  @Prop()
  publisherName?: string;

  @Prop({ type: Number, min: 0, max: 100 })
  publisherPercentage?: number;

  @Prop()
  subPublisherName?: string;

  @Prop({ type: Number, min: 0, max: 100 })
  subPublisherPercentage?: number;
}

export const ContributorSchema = SchemaFactory.createForClass(Contributor);