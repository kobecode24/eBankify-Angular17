import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap, finalize, switchMap} from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { User } from '../models/user.model';
import { LoginCredentials, RegisterRequest, AuthResponse } from '../models/auth.model';
import { environment } from "../../../environments/environment";
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  router = inject(Router);
  private tokenService = inject(TokenService);

  // Core state signals
  private currentUser = signal<User | null>(null);
  private isLoading = signal(false);
  private error = signal<string | null>(null);
  private initialized = signal(false);
  private tokenRefreshInProgress = signal(false);

  // Computed states
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role);

  private readonly httpOptions = {
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json'),
    withCredentials: true
  };

  constructor() {
    // Authentication state effect
    effect(() => {
      const user = this.currentUser();
      if (user) {
        console.debug('User authenticated:', user.email);
        this.startRefreshTokenTimer();
      } else {
        console.debug('User not authenticated');
        this.stopRefreshTokenTimer();
      }
    });
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, this.httpOptions).pipe(
      tap(response => {
        this.handleAuthenticationSuccess(response);
        void this.router.navigate(['/dashboard']);
        window.location.reload();
      }),
      map(response => response.user),
      catchError(error => {
        this.error.set('Invalid credentials');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  register(request: RegisterRequest): Observable<User> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request, this.httpOptions).pipe(
      tap(response => {
        this.handleAuthenticationSuccess(response);
        void this.router.navigate(['/dashboard']);
      }),
      map(response => response.user),
      catchError(error => {
        this.error.set(error.error?.message || 'Registration failed');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  async logout(): Promise<void> {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
    await this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.tokenRefreshInProgress()) {
      return throwError(() => new Error('Token refresh in progress'));
    }

    this.tokenRefreshInProgress.set(true);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, {
      refreshToken: this.tokenService.getRefreshToken()
    }).pipe(
      tap(response => this.handleAuthenticationSuccess(response)),
      catchError(error => {
        void this.logout();
        return throwError(() => error);
      }),
      finalize(() => this.tokenRefreshInProgress.set(false))
    );
  }

  initializeAuthentication(): Observable<boolean> {
    if (this.initialized()) {
      return new Observable<boolean>(subscriber => {
        subscriber.error(new Error('Already initialized'));
      });
    }

    const token = this.tokenService.getAccessToken();
    if (!token || this.tokenService.isTokenExpired()) {
      this.initialized.set(true);
      return new Observable<boolean>(subscriber => {
        subscriber.next(false);
        subscriber.complete();
      });
    }

    return this.http.get<User>(`${environment.apiUrl}/auth/verify`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      withCredentials: true
    }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.startRefreshTokenTimer();
      }),
      map(() => {
        this.initialized.set(true);
        return true;
      }),
      catchError(() => {
        this.tokenService.clearTokens();
        this.currentUser.set(null);
        this.initialized.set(true);
        return new Observable<boolean>(subscriber => {
          subscriber.next(false);
          subscriber.complete();
        });
      })
    );
  }
  private handleAuthenticationSuccess(response: AuthResponse): void {
    this.tokenService.setTokens(response.token, response.refreshToken);
    this.currentUser.set(response.user);
  }

  private refreshTokenTimeout: number | null = null;

  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer();

    const expiryTime = this.tokenService.getTokenExpirationTime();
    if (!expiryTime) return;

    const timeUntilExpiry = expiryTime.getTime() - Date.now() - 60000; // 1 min before expiry

    if (timeUntilExpiry <= 0) {
      this.refreshToken().subscribe();
      return;
    }

    this.refreshTokenTimeout = window.setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => void this.logout()
      });
    }, timeUntilExpiry);
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser()).pipe(
      switchMap(user => {
        if (!user && !this.initialized()) {
          return this.initializeAuthentication().pipe(
            map(() => this.currentUser())
          );
        }
        return of(user);
      })
    );
  }

  // Public signals for components
  readonly user = computed(() => this.currentUser());
  readonly loading = computed(() => this.isLoading());
  readonly errorMessage = computed(() => this.error());
}
