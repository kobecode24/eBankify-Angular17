// src/app/shared/features/banking/banking.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        loadComponent: () => import('./banking-dashboard/banking-dashboard.component')
          .then(m => m.BankingDashboardComponent)
      }
    ])
  ]
})
export class BankingModule { }
