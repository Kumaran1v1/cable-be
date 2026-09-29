import { Request } from "express";
import { Document, Types } from "mongoose";

export type UserRole = "admin" | "manager" | "user" | "ADMIN";

export interface IUser {
  name: string;
  email: string;
  mobile?: string;
  companyName?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "";
  profileImage?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface JWTPayload {
  id: string;
  email?: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: UserRole;
  };
}
