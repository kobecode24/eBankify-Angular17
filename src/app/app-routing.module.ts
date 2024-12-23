// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './shared/features/auth/pages/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';
import {RegisterComponent} from "./shared/features/auth/pages/register/register.component";
import {LoginComponent} from "./shared/features/auth/pages/login/login.component";

const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN] },
        loadChildren: () => import('././shared/features/admin/admin.module').then(m => m.AdminModule)
      },
      {
        path: 'banking',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.USER, UserRole.ADMIN] },
        loadChildren: () => import('././shared/features/banking/banking.module').then(m => m.BankingModule)
      },
      {
        path: 'employee',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.EMPLOYEE] },
        loadChildren: () => import('./shared/features/employee/employee.module').then(m => m.EmployeeModule)
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
