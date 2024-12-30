// features/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardLayoutComponent} from "../../../components/dashboard-layout/dashboard-layout.component";
import {DashboardStats} from "../../../../core/models/dashboard.model";
import {DashboardService} from "../../../../core/services/dashboard.service";
import {UserResponse, UserService} from "../../../../core/services/user.service";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout title="Administrator Dashboard">
      <div stats class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="value">{{stats?.totalUsers || 0}}</p>
        </div>
        <div class="stat-card">
          <h3>Active Users</h3>
          <p class="value">{{stats?.activeUsers || 0}}</p>
        </div>
        <div class="stat-card">
          <h3>Total Transactions</h3>
          <p class="value">{{stats?.totalTransactions || 0}}</p>
        </div>
      </div>

      <div class="content-section">
        <h2>User Management</h2>
        <div class="user-management-tools">
          <div class="search-bar">
            <input type="text" placeholder="Search users..."> <!--(input)="searchUsers($event)"-->
          </div>
          <button class="primary-button" (click)="openNewUserModal()">Add User</button>
        </div>

        <div class="user-list">
          <div *ngFor="let user of users" class="user-card">
            <div class="user-info">
              <h4>{{user.name}}</h4>
              <p>{{user.email}}</p>
              <span class="role-badge" [ngClass]="user.role.toLowerCase()">
                {{user.role}}
              </span>
            </div>
            <div class="user-actions">
              <button class="action-button" (click)="editUser(user)">Edit</button>
              <button class="action-button" [class.deactivated]="!user.isActive"
                      (click)="toggleUserStatus(user)">
                {{user.isActive ? 'Deactivate' : 'Activate'}}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <h2>System Monitoring</h2>
        <div class="system-stats">
          <!-- Add system monitoring content -->
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  users: UserResponse[] = [];
  isLoading = false;

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;

    this.dashboardService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load dashboard stats:', error);
        this.isLoading = false;
      }
    });

    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => console.error('Failed to load users:', error)
    });
  }

  /*searchUsers(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query.length >= 3) {
      this.userService.searchUsers(query).subscribe(users => this.users = users);
    } else if (query.length === 0) {
      this.loadUsers();
    }
  }*/

  editUser(user: UserResponse) {
    // Implement edit user logic
  }

  toggleUserStatus(user: UserResponse) {
    // Implement user status toggle logic
  }

  openNewUserModal() {
    // Implement new user creation logic
  }
}
