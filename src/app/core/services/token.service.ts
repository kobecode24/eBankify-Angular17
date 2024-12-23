// core/services/token.service.ts
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  constructor() {}

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

    const decodedToken = this.decodeToken(accessToken);
    if (decodedToken?.exp) {
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, (decodedToken.exp * 1000).toString());
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  getDecodedAccessToken(): any {
    const token = this.getAccessToken();
    return token ? this.decodeToken(token) : null;
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpirationTime();
    return !expiry || expiry <= new Date();
  }

  getTokenExpirationTime(): Date | null {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiry ? new Date(parseInt(expiry)) : null;
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
