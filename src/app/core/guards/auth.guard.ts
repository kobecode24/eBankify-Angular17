import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export const AuthGuard = (): Observable<boolean> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  const token = tokenService.getAccessToken();
  console.debug('AuthGuard: Current token status', {
    hasToken: !!token,
    isExpired: tokenService.isTokenExpired(),
  });

  if (!token || tokenService.isTokenExpired()) {
    console.debug('AuthGuard: No valid token found, redirecting to login');
    void router.navigate(['/auth/login'], {
      queryParams: { returnUrl: router.url },
    });
    return of(false);
  }

  return authService.getCurrentUser().pipe(
    switchMap(user => {
      if (!user) {
        console.debug('AuthGuard: No user found, initializing authentication');
        return authService.initializeAuthentication().pipe(
          map(isAuthenticated => {
            if (!isAuthenticated) {
              console.debug('AuthGuard: Authentication failed, redirecting to login');
              void router.navigate(['/auth/login'], {
                queryParams: { returnUrl: router.url },
              });
              return false;
            }
            return true;
          })
        );
      }

      console.debug('AuthGuard: Access granted for user', {
        userId: user.userId,
        role: user.role,
      });
      return of(true);
    })
  );
};
