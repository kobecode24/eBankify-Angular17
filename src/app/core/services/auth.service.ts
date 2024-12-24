import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, EMPTY, finalize, Observable, of, ReplaySubject, throwError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { User } from '../models/user.model';
import { LoginCredentials, RegisterRequest, AuthResponse } from '../models/auth.model';
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private refreshTokenSubject = new ReplaySubject<AuthResponse>(1);
  private refreshTokenTimeout: any;
  private readonly API_URL = environment.apiUrl + '/auth';
  private readonly REFRESH_THRESHOLD = 60000; // 1 minute before expiry
  private http = inject(HttpClient);
  router = inject(Router);
  private tokenService = inject(TokenService);
  private httpOptions: { headers: HttpHeaders; withCredentials: boolean };
  private tokenRefreshInProgress = false;
  private initialized = false;

  constructor() {
    this.httpOptions = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json'),
      withCredentials: true
    };
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  login(credentials: LoginCredentials): Observable<User> {
    console.debug('Attempting login for user:', credentials.email);
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, this.httpOptions).pipe(
      tap(response => {
        console.debug('Login successful');
        this.handleAuthenticationSuccess(response);
        void this.router.navigate(['/dashboard']);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Invalid credentials'));
      })
    );
  }

  register(request: RegisterRequest): Observable<User> {
    console.debug('Attempting registration for user:', request.email);
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request, this.httpOptions).pipe(
      tap(response => {
        console.debug('Registration successful');
        this.handleAuthenticationSuccess(response);
        void this.router.navigate(['/dashboard']);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Registration failed:', error);
        const errorMessage = error.error?.message || 'Registration failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async logout(): Promise<void> {
    try {
      console.debug('Performing logout');
      this.tokenService.clearTokens();
      this.currentUserSubject.next(null);
      this.stopRefreshTokenTimer();
      await this.router.navigate(['/auth/login']);
      console.debug('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.tokenRefreshInProgress) {
      console.debug('Token refresh already in progress');
      return this.refreshTokenSubject.asObservable();
    }

    console.debug('Starting token refresh');
    this.tokenRefreshInProgress = true;

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, {
      refreshToken: this.tokenService.getRefreshToken()
    }).pipe(
      tap(response => {
        console.debug('Token refresh successful');
        this.handleAuthenticationSuccess(response);
        this.refreshTokenSubject.next(response);
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        void this.logout();
        return throwError(() => new Error('Token refresh failed: ' + error.message));
      }),
      finalize(() => {
        this.tokenRefreshInProgress = false;
      })
    );
  }

  public initializeAuthentication(): Observable<boolean> {
    if (this.initialized) {
      return of(true);
    }

    const token = this.tokenService.getAccessToken();

    if (!token) {
      this.initialized = true;
      return of(false);
    }

    if (this.tokenService.isTokenExpired()) {
      this.tokenService.clearTokens();
      this.initialized = true;
      return of(false);
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<User>(`${this.API_URL}/verify`, {
      headers,
      withCredentials: true
    }).pipe(
      tap(user => {
        console.debug('Token verification successful');
        this.currentUserSubject.next(user);
        this.startRefreshTokenTimer();
      }),
      map(() => {
        this.initialized = true;
        return true;
      }),
      catchError(error => {
        console.error('Token verification failed:', error);
        this.tokenService.clearTokens();
        this.currentUserSubject.next(null);
        this.initialized = true;
        return of(false);
      })
    );
  }

  private handleAuthenticationSuccess(response: AuthResponse): void {
    console.debug('Handling authentication success');
    this.tokenService.setTokens(response.token, response.refreshToken);
    this.currentUserSubject.next(response.user);
    this.startRefreshTokenTimer();
  }

  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer();
    const expiryTime = this.tokenService.getTokenExpirationTime();

    if (!expiryTime) {
      console.warn('No token expiry time available');
      return;
    }

    const timeUntilExpiry = expiryTime.getTime() - Date.now() - this.REFRESH_THRESHOLD;
    console.debug(`Token refresh scheduled in ${timeUntilExpiry}ms`);

    if (timeUntilExpiry <= 0) {
      console.debug('Token requires immediate refresh');
      this.refreshToken().subscribe();
      return;
    }

    this.refreshTokenTimeout = setTimeout(() => {
      console.debug('Initiating scheduled token refresh');
      this.refreshToken().subscribe({
        error: (error) => {
          console.error('Scheduled token refresh failed:', error);
          void this.logout();
        }
      });
    }, timeUntilExpiry);
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      console.debug('Stopping refresh timer');
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}
