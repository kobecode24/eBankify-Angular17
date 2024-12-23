// src/app/shared/features/auth/components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <a routerLink="/banking" routerLinkActive="active">Banking</a>
        <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
        <a routerLink="/loans" routerLinkActive="active">Loans</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {}
