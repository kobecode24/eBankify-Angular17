import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/features/auth/pages/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';
import { DashboardComponent } from "./shared/features/dashboard/dashboard.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
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
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadComponent: () => import('./shared/features/admin/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'banking',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.USER, UserRole.ADMIN] },
        loadComponent: () => import('./shared/features/banking/banking-dashboard/banking-dashboard.component')
          .then(m => m.BankingDashboardComponent)
      },
      {
        path: 'employee',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.EMPLOYEE] },
        loadComponent: () => import('./shared/features/employee/employee-dashboard/employee-dashboard.component')
          .then(m => m.EmployeeDashboardComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
