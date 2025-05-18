import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SongwriterDocument = Songwriter & Document;

// Define the schema for PenName
@Schema({ _id: true })
export class PenName {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;
}

// Create a schema for PenName
export const PenNameSchema = SchemaFactory.createForClass(PenName);

// Same approach for other nested types
@Schema({ _id: false })
export class Heir {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  relationship: string;
}

@Schema({ _id: false })
export class Contract {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  terms: string;
}

@Schema({ timestamps: true })
export class Songwriter {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  

  @Prop({ type: String }) // Explicit type definition
  icNumber: string;

  @Prop({ type: String }) // Added address field
  address: string;

  @Prop({ type: Boolean, default: false }) // Added MACP status field
  macp: boolean;

  @Prop({ type: String }) // Added TIN Number field
  tinNumber: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  // Use the schema for the array
  @Prop({ type: [PenNameSchema] })
  penNames: PenName[];

  @Prop({ type: Contract })
  contract: Contract;

  @Prop()
  deal: string;

  @Prop({ type: Heir })
  heir: Heir;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: string;
}

export const SongwriterSchema = SchemaFactory.createForClass(Songwriter);