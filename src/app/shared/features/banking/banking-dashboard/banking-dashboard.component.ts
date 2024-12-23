import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the admin dashboard</p>
    </div>
  `
})
export class BankingDashboardComponent {}
