// src/catalogs/schemas/catalog.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CatalogType {
  ADAPTATION = 'adaptation',
  ORIGINAL = 'original',
}

export enum VersionType {
  REMIX = 'remix',
  COVER = 'cover',
}

export enum CatalogStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CONFLICT = 'conflict',
}

export enum SongType {
  COMMERCIAL = 'commercial',
  JINGLES = 'jingles',
  SCORING = 'scoring',
  MONTAGE = 'montage',
}

export type CatalogDocument = Document & Catalog;

@Schema({ timestamps: true })
export class Catalog {
  @Prop({ required: true, unique: true })
  tapNumber: string; // TAP-YYYY-XXXX-MY format

  @Prop()
  invCode?: string;

  @Prop({ type: [String] })
  ipiCode?: string[];

  @Prop()
  iswcCode?: string;

  @Prop()
  isrcCode?: string;

  @Prop()
  tagging?: string;

  @Prop({ enum: SongType })
  songType?: SongType;

  @Prop({ required: true })
  title: string;
  
  @Prop()
  alternateTitle?: string;

  @Prop()
  performer?: string;

  @Prop({ enum: CatalogType, default: CatalogType.ORIGINAL })
  type: CatalogType;
  
  @Prop({ enum: VersionType })
  versionType?: VersionType; // Added version type field for remix/cover

  @Prop()
  genre?: string;

  @Prop()
  remarks?: string;
  
  @Prop()
  youtubeLink?: string;

  @Prop({ required: true, type: Date })
  dateIn: Date;

  @Prop({ type: Date })
  dateOut?: Date;

  @Prop({ 
    type: String, 
    enum: CatalogStatus, 
    default: CatalogStatus.PENDING 
  })
  status: CatalogStatus;

  @Prop()
  audioFilePath?: string;

  @Prop({ default: 0 })
  totalRevenue: number; // Total income received

  @Prop()
  parentTapNumber?: string; // For remix/cover versions, reference to original

  @Prop()
  createdBy?: string;

  @Prop({ type: Number })
  countrycover?: number;

  @Prop({ type: [String] })
  selectedCountries?: string[];
}

export const CatalogSchema = SchemaFactory.createForClass(Catalog);