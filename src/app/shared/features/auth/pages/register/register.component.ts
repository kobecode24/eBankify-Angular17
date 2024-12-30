// src/app/shared/features/auth/pages/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class RegisterComponent {
  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    age: ['', [Validators.required, Validators.min(18)]],
    monthlyIncome: ['', [Validators.required, Validators.min(0)]],
    creditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registerForm.valid) {
      const registerData: RegisterRequest = {
        ...this.registerForm.value,
        role: 'USER'
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/login']).then(r => console.debug('Registration successful, redirecting to login' , { r }));
        },
        error: (error) => {
          console.error('Registration failed:', error);
        }
      });
    }
  }
}
