import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthService} from "./core/services/auth.service";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    console.debug('Application initialization started');

    this.authService.initializeAuthentication()
      .pipe(
        tap(success => {
          console.debug('Authentication initialization completed:', { success });
        })
      )
      .subscribe({
        next: (authenticated) => {
          if (!authenticated) {
            console.debug('User not authenticated, redirecting to login');
            void this.authService.router.navigate(['/auth/login']);
          }
        },
        error: (error) => {
          console.error('Authentication initialization failed:', error);
          void this.authService.router.navigate(['/auth/login']);
        }
      });
  }
}
