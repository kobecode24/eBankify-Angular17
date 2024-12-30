// features/employee/employee-dashboard/employee-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BaseDashboardComponent} from "../../../components/base-dashboard/base-dashboard.component";
import {AuthService} from "../../../../core/services/auth.service";
import {CustomerService} from "../../../../core/services/dashboard.service";

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="employee-dashboard">
      <header class="dashboard-header">
        <h1>Employee Portal</h1>
        <div class="quick-stats">
          <div class="stat-card">
            <h3>Pending Requests</h3>
            <p>{{pendingRequests}}</p>
          </div>
          <div class="stat-card">
            <h3>Active Customers</h3>
            <p>{{activeCustomers}}</p>
          </div>
        </div>
      </header>

      <div class="dashboard-content">
        <section class="customer-support">
          <h2>Support Requests</h2>
          <div class="support-tickets">
            <div *ngFor="let ticket of supportTickets" class="ticket-card">
              <div class="ticket-info">
                <h4>{{ticket.subject}}</h4>
                <p>{{ticket.customerName}}</p>
                <span class="priority-badge">{{ticket.priority}}</span>
              </div>
              <div class="ticket-actions">
                <button (click)="handleTicket(ticket)">Handle Request</button>
              </div>
            </div>
          </div>
        </section>

        <section class="customer-search">
          <h2>Customer Lookup</h2>
          <!-- Implement customer search functionality -->
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent extends BaseDashboardComponent implements OnInit {
  supportTickets = [];
  pendingRequests = 0;
  activeCustomers = 0;

  constructor(
    authService: AuthService,
    private customerService: CustomerService
  ) {
    super(authService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadSupportTickets();
    this.loadCustomerStats();
  }

  private loadSupportTickets() {
    // Implement support ticket loading
  }

  private loadCustomerStats() {
    // Implement customer statistics loading
  }

  handleTicket(ticket: any) {
    // Implement ticket handling functionality
  }
}
