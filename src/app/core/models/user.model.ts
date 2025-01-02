// core/models/user.model.ts
import {Account} from "./account.model";

export interface User {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  age: number;
  monthlyIncome: number;
  creditScore: number;
  accounts?: Account[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  EMPLOYEE = 'EMPLOYEE'
}

// user response
export interface UserResponse {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  age: number;
  monthlyIncome: number;
  creditScore: number;
  isActive?: boolean;
  accounts?: Account[];
  createdAt: Date;
  updatedAt: Date;
}

