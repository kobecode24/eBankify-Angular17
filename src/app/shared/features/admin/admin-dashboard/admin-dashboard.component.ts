// features/admin/admin-dashboard/admin-dashboard.component.ts
import {Component, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardLayoutComponent} from "../../../components/dashboard-layout/dashboard-layout.component";
import {DashboardStats} from "../../../../core/models/dashboard.model";
import {DashboardService} from "../../../../core/services/dashboard.service";
import {UserRegistrationRequest, UserResponse, UserService} from "../../../../core/services/user.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {Dialog} from "@angular/cdk/dialog";
import {UserEditDialogComponent} from "./user-edit-dialog.component";
import {UserCreateDialogComponent} from "./user-create-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    DashboardLayoutComponent,
    UserEditDialogComponent,
    UserCreateDialogComponent],
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
  searchQuery = signal('');

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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
    const dialogRef = this.dialog.open<UserEditDialogComponent, {user: UserResponse}, any>(
      UserEditDialogComponent,
      {
        width: '500px',
        data: { user }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user.userId, result).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Failed to update user:', error);
            this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  toggleUserStatus(user: UserResponse) {
    // Convert UserResponse to UserRegistrationRequest
    const updateRequest: UserRegistrationRequest = {
      name: user.name,
      email: user.email,
      password: '',
      age: user.age,
      monthlyIncome: user.monthlyIncome,
      creditScore: user.creditScore,
      role: user.role,
      isActive: !user.isActive
    };

    this.userService.updateUser(user.userId, updateRequest).subscribe({
      next: () => {
        this.snackBar.open('User status updated successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to toggle user status:', error);
        this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
      }
    });
  }

  openNewUserModal() {
    const dialogRef = this.dialog.open<UserCreateDialogComponent, void, any>(
      UserCreateDialogComponent,
      { width: '500px' }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Failed to create user:', error);
            this.snackBar.open('Failed to create user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  searchUsers(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);

    if (query.length >= 3) {
      this.users = this.users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
    } else if (query.length === 0) {
      this.loadUsers();
    }
  }


}
