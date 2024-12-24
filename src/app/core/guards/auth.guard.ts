import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take, switchMap, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from "../services/token.service";

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
      take(1),
      switchMap(user => {
        const token = this.tokenService.getAccessToken();
        console.debug('AuthGuard: Current token status', {
          hasToken: !!token,
          isExpired: this.tokenService.isTokenExpired()
        });

        if (!token || this.tokenService.isTokenExpired()) {
          console.debug('AuthGuard: No valid token found, redirecting to login');
          void this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return of(false);
        }

        if (!user) {
          console.debug('AuthGuard: No user found, initializing authentication');
          return this.authService.initializeAuthentication().pipe(
            map(isAuthenticated => {
              if (!isAuthenticated) {
                void this.router.navigate(['/auth/login'], {
                  queryParams: { returnUrl: state.url }
                });
                return false;
              }
              return true;
            })
          );
        }

        console.debug('AuthGuard: Access granted for user', {
          userId: user.userId,
          role: user.role
        });
        return of(true);
      })
    );
  }
}
