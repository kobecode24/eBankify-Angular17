// core/models/auth.model.ts
import {User, UserRole} from "./user.model";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  monthlyIncome: number;
  creditScore: number;
  role: UserRole;
}

export interface AuthResponse {
  refreshToken: string;
  token: string;
  user: User;
}
