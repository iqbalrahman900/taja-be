import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaggingSongDocument = TaggingSong & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class TaggingSong {
  @Prop({ required: true })
  categoryName: string;
  
  @Prop({ default: true })
  isActive: boolean;
}

export const TaggingSongSchema = SchemaFactory.createForClass(TaggingSong);