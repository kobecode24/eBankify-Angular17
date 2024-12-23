// src/app/shared/features/employee/employee.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        loadComponent: () => import('./employee-dashboard/employee-dashboard.component')
          .then(m => m.EmployeeDashboardComponent)
      }
    ])
  ]
})
export class EmployeeModule { }
