import { Routes } from '@angular/router';
import {EmployeeDashboardComponent} from "./employee-dashboard/employee-dashboard.component";

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: EmployeeDashboardComponent
  }
];
