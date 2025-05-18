// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Define a more explicit interface for Mongoose documents that includes _id and timestamps
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  role: UserRole;
  companyName: string;
  fullName?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  // Include Mongoose document methods
  toObject(): Record<string, any>;
  toJSON(): Record<string, any>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ required: true })
  companyName: string;

  @Prop()
  fullName?: string;

  @Prop()
  email?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);