// core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {DashboardStats, CustomerStats, SupportTicket} from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/admin/stats`);
  }

  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(`${this.API_URL}/customer/stats`);
  }
}

// core/services/customer.service.ts
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly API_URL = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getSupportTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.API_URL}/support-tickets`);
  }

  updateTicketStatus(ticketId: string, status: string): Observable<SupportTicket> {
    return this.http.patch<SupportTicket>(
      `${this.API_URL}/support-tickets/${ticketId}`,
      { status }
    );
  }
}
