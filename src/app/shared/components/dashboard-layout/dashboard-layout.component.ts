// shared/components/dashboard-layout/dashboard-layout.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>{{title}}</h1>
        <div class="stats-container">
          <ng-content select="[stats]"></ng-content>
        </div>
      </header>

      <div class="dashboard-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/dashboard.scss']
})
export class DashboardLayoutComponent {
  @Input() title: string = '';
}
