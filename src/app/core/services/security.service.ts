// core/services/security.service.ts
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { User, UserRole } from "../models/user.model";

@Injectable({ providedIn: 'root' })
export class SecurityService {
  constructor(private authService: AuthService) {}

  hasRole(requiredRole: UserRole): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => user?.role === requiredRole)
    );
  }

  hasAnyRole(requiredRoles: UserRole[]): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => user ? requiredRoles.includes(user.role) : false)
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => !!user)
    );
  }

  canAccessResource(userId: number): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) return false;
        if (user.role === UserRole.ADMIN) return true;
        return user.userId === userId;
      })
    );
  }
}
