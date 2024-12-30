// shared/components/base-dashboard/base-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  template: ''
})
export abstract class BaseDashboardComponent implements OnInit {
  protected currentUser: User | null = null;
  protected isLoading = false;
  protected error: string | null = null;

  constructor(protected authService: AuthService) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => this.currentUser = user,
      error: (error) => this.error = 'Failed to load user information'
    });
  }

  protected handleError(error: any, message: string) {
    console.error(message, error);
    this.error = message;
    this.isLoading = false;
  }
}
