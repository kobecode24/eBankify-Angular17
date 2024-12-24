// core/guards/session.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, map } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SessionGuard implements CanActivate {
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        if (this.tokenService.isTokenExpired()) {
          return this.handleExpiredToken();
        }

        return true;
      })
    );
  }

  private handleExpiredToken(): boolean {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.authService.logout();
      return false;
    }

    this.authService.refreshToken().subscribe({
      error: () => this.authService.logout()
    });
    return false;
  }
}
