import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the Contract schema as a nested schema
@Schema({ _id: false })
export class Contract {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop()
  terms?: string;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);

export type OriginalPublishingDocument = OriginalPublishing & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class OriginalPublishing {
  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  officialEmail: string;

  @Prop({ required: true })
  companyRegistrationNo: string;
  
  @Prop({ required: true })
  tinNumber: string;
  
  @Prop({ required: true })
  address: string;

  // PIC (Person In Charge) details
  @Prop({ required: true })
  picName: string;

  @Prop({ required: true })
  picTelNo: string;

  @Prop({ required: true })
  picEmail: string;

  @Prop({ required: true })
  picPosition: string; // "Jawatan PIC" - position/role of the PIC
  
  @Prop()
  deal?: string;
  
  // Embedded contract document
  @Prop({ type: ContractSchema })
  contract?: Contract;
}

export const OriginalPublishingSchema = SchemaFactory.createForClass(OriginalPublishing);