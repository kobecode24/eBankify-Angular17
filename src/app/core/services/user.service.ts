import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserRole } from "../models/user.model";
import { environment } from "../../../environments/environment";

// Define the UserResponse interface to match your backend response
export interface UserResponse {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  age: number;
  monthlyIncome: number;
  creditScore: number;
  isActive?: boolean;
  accounts?: any[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.API_URL);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/${id}`);
  }

  getUsersByRole(role: UserRole): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/role/${role}`);
  }

  getUsersByAgeRange(minAge: number, maxAge: number): Observable<UserResponse[]> {
    const params = new HttpParams()
      .set('minAge', minAge.toString())
      .set('maxAge', maxAge.toString());
    return this.http.get<UserResponse[]>(`${this.API_URL}/age-range`, { params });
  }

  getUsersByIncomeRange(minIncome: number, maxIncome: number): Observable<UserResponse[]> {
    const params = new HttpParams()
      .set('minIncome', minIncome.toString())
      .set('maxIncome', maxIncome.toString());
    return this.http.get<UserResponse[]>(`${this.API_URL}/income-range`, { params });
  }

  getUsersByMinCreditScore(minCreditScore: number): Observable<UserResponse[]> {
    const params = new HttpParams()
      .set('minCreditScore', minCreditScore.toString());
    return this.http.get<UserResponse[]>(`${this.API_URL}/credit-score`, { params });
  }

  createUser(user: UserRegistrationRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.API_URL, user);
  }

  updateUser(id: number, user: UserRegistrationRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  checkLoanEligibility(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${id}/loan-eligibility`);
  }
}

export interface UserRegistrationRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  monthlyIncome: number;
  creditScore: number;
  role: UserRole;
  isActive?: boolean;
}
