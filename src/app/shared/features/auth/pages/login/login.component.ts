import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent {
  public loginForm: FormGroup;
  public loginError: string = '';
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  public onSubmit(): void {
    console.debug('Login form submitted');

    if (this.loginForm.valid) {
      console.debug('Login form is valid, proceeding with submission');
      this.isLoading = true;
      this.loginError = '';

      const credentials: LoginCredentials = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (user) => {
          console.debug('Login successful, user:', user);
          const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
          console.debug('Navigating to:', returnUrl);
          this.router.navigate([returnUrl]).then(() => {
            console.debug('Navigation completed');
          });
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loginError = 'Invalid email or password';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
