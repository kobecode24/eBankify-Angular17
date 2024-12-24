// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {AuthService} from "../../../core/services/auth.service";
import {User} from "../../../core/models/user.model";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Welcome {{currentUser?.name}}</h1>
      <div class="user-info">
        <p>Email: {{currentUser?.email}}</p>
        <p>Role: {{currentUser?.role}}</p>
      </div>
      <div class="actions">
        <button (click)="logout()">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .user-info {
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .actions button {
      padding: 10px 20px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .actions button:hover {
      background-color: #c82333;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (!user) {
          void this.router.navigate(['/auth/login']);
          return;
        }
        this.currentUser = user;
      },
      error: () => {
        void this.router.navigate(['/auth/login']);
      }
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
