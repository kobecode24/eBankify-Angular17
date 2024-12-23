// src/app/shared/features/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard</p>
    </div>
  `
})
export class DashboardComponent {}
