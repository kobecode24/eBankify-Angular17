import {Component, computed, inject} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {UserRole} from "../../../core/models/user.model";
import {AuthService} from "../../../core/services/auth.service";

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <mat-icon>account_balance</mat-icon>
        <span>eBankify</span>
      </div>

      <nav class="sidebar-nav">
        @for (item of filteredMenuItems(); track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="active"
             class="nav-item">
            <mat-icon>{{item.icon}}</mat-icon>
            <span>{{item.label}}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/profile" routerLinkActive="active" class="nav-item">
          <mat-icon>account_circle</mat-icon>
          <span>Profile</span>
        </a>
        <a (click)="logout()" class="nav-item logout">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);

  private menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/banking', label: 'Banking', icon: 'account_balance', roles: [UserRole.USER, UserRole.ADMIN] },
    { path: '/transactions', label: 'Transactions', icon: 'swap_horiz', roles: [UserRole.USER, UserRole.ADMIN] },
    { path: '/loans', label: 'Loans', icon: 'monetization_on', roles: [UserRole.USER, UserRole.ADMIN] },
    { path: '/admin', label: 'Admin Panel', icon: 'admin_panel_settings', roles: [UserRole.ADMIN] },
    { path: '/customers', label: 'Customers', icon: 'people', roles: [UserRole.EMPLOYEE] },
    { path: '/support', label: 'Support', icon: 'help', roles: [UserRole.EMPLOYEE] },
    { path: '/settings', label: 'Settings', icon: 'settings' }
  ];


  filteredMenuItems = computed(() => {
    const userRole = this.authService.userRole();
    if (!userRole) {
      return [];  // Return empty array if no role is found
    }

    return this.menuItems.filter(item =>
      !item.roles || item.roles.includes(userRole)
    );
  });

  logout() {
    this.authService.logout();
  }
}
