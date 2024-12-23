// src/app/shared/features/auth/pages/layout/layout.component.ts
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import {HeaderComponent} from "../../../../components/header/header.component";
import {SidebarComponent} from "../../../../components/sidebar/sidebar.component";
import {FooterComponent} from "../../../../components/footer/footer.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="layout">
      <app-header></app-header>
      <div class="content">
        <app-sidebar></app-sidebar>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {}
