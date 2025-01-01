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

  return new Observable<boolean>(subscriber => {
    const token = tokenService.getAccessToken();

    if (!token || tokenService.isTokenExpired()) {
      console.debug('AuthGuard: Token invalid or expired');
      void router.navigate(['/auth/login'], {
        queryParams: { returnUrl: router.url }
      });
      subscriber.next(false);
      subscriber.complete();
      return;
    }

    authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return authService.initializeAuthentication();
        }
        return of(true);
      }),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          void router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url }
          });
          return false;
        }
        return true;
      })
    ).subscribe({
      next: (value) => {
        subscriber.next(value);
        subscriber.complete();
      },
      error: (error) => {
        console.error('Authentication error:', error);
        void router.navigate(['/auth/login']);
        subscriber.next(false);
        subscriber.complete();
      }
    });
  });
};
