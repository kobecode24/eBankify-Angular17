// core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { User } from '../models/user.model';
import { LoginCredentials, RegisterRequest, AuthResponse } from '../models/auth.model';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private refreshTokenTimeout: any;
  private readonly API_URL = environment.apiUrl + '/auth';
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private httpOptions: { headers: HttpHeaders; withCredentials: boolean };


  constructor() {
    this.initializeAuthentication();
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
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials, this.httpOptions).pipe(
      tap(response => {
        // Store tokens first
        this.tokenService.setTokens(response.token, response.refreshToken);
        // Then update current user
        this.currentUserSubject.next(response.user);
        // Start the refresh timer
        this.startRefreshTokenTimer();
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Invalid credentials'));
      })
    );
  }

  register(request: RegisterRequest): Observable<User> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Access-Control-Allow-Origin', 'http://localhost:4200');

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request, {
      headers: headers,
      withCredentials: true
    }).pipe(
      tap(response => {
        this.handleAuthenticationSuccess(response);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('Registration failed:', error);
        const errorMessage = error.error?.message || 'Registration failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  logout(): void {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
    this.stopRefreshTokenTimer();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, {
      refreshToken: this.tokenService.getRefreshToken()
    }).pipe(
      tap(response => this.handleAuthenticationSuccess(response)),
      catchError(error => {
        this.logout();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  private initializeAuthentication(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      this.verifyStoredToken();
    }
  }

  private verifyStoredToken(): void {
    // Add Authorization header with the stored token
    const token = this.tokenService.getAccessToken();
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.get<User>(`${this.API_URL}/verify`, { headers }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.startRefreshTokenTimer();
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Token verification failed'));
      })
    ).subscribe();
  }

  private handleAuthenticationSuccess(response: AuthResponse): void {
    this.tokenService.setTokens(response.token, response.refreshToken);
    this.currentUserSubject.next(response.user);
    this.startRefreshTokenTimer();
  }

  private startRefreshTokenTimer(): void {
    const jwtToken = this.tokenService.getDecodedAccessToken();
    if (jwtToken) {
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}
