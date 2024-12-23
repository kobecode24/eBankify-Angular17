// src/app/shared/features/auth/components/header/header.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="logo">
        <h1>eBankify</h1>
      </div>
      <nav class="nav-menu">
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/profile">Profile</a>
        <button (click)="logout()">Logout</button>
      </nav>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  logout(): void {
    // Implement logout logic
  }
}
