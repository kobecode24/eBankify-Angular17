import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/features/auth/pages/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { UserRole } from './core/models/user.model';
import { DashboardComponent } from "./shared/features/dashboard/dashboard.component";

export const routes: Routes = [
  // Default redirect to dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Authentication routes protected by NoAuthGuard
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./shared/features/auth/pages/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./shared/features/auth/pages/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },

  // Protected routes with layout wrapper
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard route
      {
        path: 'dashboard',
        component: DashboardComponent
      },

      // Admin routes
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./shared/features/admin/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },

      // Banking routes
      {
        path: 'banking',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.USER, UserRole.ADMIN] },
        loadComponent: () => import('./shared/features/banking/banking-dashboard/banking-dashboard.component')
          .then(m => m.BankingDashboardComponent)
      },

      // Employee routes
      {
        path: 'employee',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.EMPLOYEE] },
        loadComponent: () => import('./shared/features/employee/employee-dashboard/employee-dashboard.component')
          .then(m => m.EmployeeDashboardComponent)
      },

      {
        path: 'transactions',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.USER, UserRole.ADMIN, UserRole.EMPLOYEE] },
        loadComponent: () => import('./shared/features/transactions/transaction-list/transaction-list.component')
          .then(m => m.TransactionListComponent)
      },

      {
        path: 'accounts',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.USER, UserRole.ADMIN, UserRole.EMPLOYEE] },
        loadComponent: () => import('./shared/features/accounts/account-list/account-list.component')
          .then(m => m.AccountListComponent)
      },

      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component')
          .then(m => m.CartComponent)
      },
    ]
  },

  // Catch-all redirect to login
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
