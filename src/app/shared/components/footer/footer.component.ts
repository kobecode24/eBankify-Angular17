// src/app/shared/features/auth/components/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <p>&copy; 2024 eBankify. All rights reserved.</p>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {}
