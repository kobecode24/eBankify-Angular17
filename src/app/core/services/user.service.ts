// core/services/user.service.ts
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {User, UserRole} from "../models/user.model";
import {PaginatedResponse} from "../models/api-response.model";

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>('/api/users/profile');
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>('/api/users/profile', userData);
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>('/api/users/change-password', passwordData);
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`/api/users/${userId}`);
  }

  getUsers(filters?: { role?: UserRole; page?: number; size?: number }): Observable<PaginatedResponse<User>> {
    const params = new HttpParams({ fromObject: filters as any });
    return this.http.get<PaginatedResponse<User>>('/api/users', { params });
  }
}
