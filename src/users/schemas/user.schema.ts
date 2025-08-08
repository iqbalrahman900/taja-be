// src/users/schemas/user.schema.ts (Enhanced)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  role: UserRole;
  companyName: string;
  fullName?: string;
  email?: string;
  isActive: boolean;
  createdBy?: Types.ObjectId; // Reference to admin who created this user
  createdAt: Date;
  updatedAt: Date;
  toObject(): Record<string, any>;
  toJSON(): Record<string, any>;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ required: true })
  companyName: string;

  @Prop()
  fullName?: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);