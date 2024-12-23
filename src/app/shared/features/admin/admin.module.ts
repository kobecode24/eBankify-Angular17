// src/app/features/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      }
    ])
  ]
})
export class AdminModule { }
