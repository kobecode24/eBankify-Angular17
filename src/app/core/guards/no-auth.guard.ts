// core/guards/no-auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { map } from 'rxjs/operators';

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  const token = tokenService.getAccessToken();
  if (token && !tokenService.isTokenExpired()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return authService.getCurrentUser().pipe(
    map(user => {
      if (user) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
