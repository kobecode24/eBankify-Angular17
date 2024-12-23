// src/app/features/banking/banking.routes.ts
import { Routes } from '@angular/router';
import {BankingDashboardComponent} from "./banking-dashboard/banking-dashboard.component";

export const BANKING_ROUTES: Routes = [
  {
    path: '',
    component: BankingDashboardComponent
  }
];
