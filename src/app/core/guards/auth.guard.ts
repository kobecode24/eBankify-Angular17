// core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {TokenService} from "../services/token.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.debug('AuthGuard: Checking route access', state.url);

    return this.authService.getCurrentUser().pipe(
      map(user => {
        const token = this.tokenService.getAccessToken();
        console.debug('AuthGuard: Current token status', {
          hasToken: !!token,
          isExpired: this.tokenService.isTokenExpired()
        });

        if (!token || this.tokenService.isTokenExpired()) {
          console.debug('AuthGuard: No valid token found, redirecting to login');
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        if (!user) {
          console.debug('AuthGuard: No user found, initializing authentication');
          this.authService.initializeAuthentication();
          return true;
        }

        console.debug('AuthGuard: Access granted');
        return true;
      })
    );
  }
}
