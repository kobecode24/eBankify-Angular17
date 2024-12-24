import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../../core/models/auth.model';
import { TokenService } from '../../../../../core/services/token.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public loginError: string = '';
  public isLoading: boolean = false;
  public showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$')
      ]]
    });
  }

  ngOnInit(): void {
    if (this.tokenService.getAccessToken() && !this.tokenService.isTokenExpired()) {
      this.authService.getCurrentUser()
        .pipe(take(1))
        .subscribe(user => {
          if (user) {
            void this.router.navigate(['/dashboard']);
          }
        });
    }
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control?.errors || !control.touched) {
      return '';
    }

    if (controlName === 'email') {
      if (control.errors['required']) {
        return 'Email is required';
      }
      if (control.errors['email'] || control.errors['pattern']) {
        return 'Please enter a valid email address';
      }
    }

    if (controlName === 'password') {
      if (control.errors['required']) {
        return 'Password is required';
      }
      if (control.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
      if (control.errors['pattern']) {
        return 'Password must contain at least one number, one uppercase, one lowercase letter and one special character';
      }
    }

    return 'Invalid input';
  }

  public onSubmit(): void {
    if (!this.loginForm.valid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const credentials: LoginCredentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        console.debug('Login successful, navigating to dashboard');
        this.router.navigate(['/dashboard'], {
          replaceUrl: true
        }).then(() => {
          console.debug('Navigation to dashboard completed');
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
