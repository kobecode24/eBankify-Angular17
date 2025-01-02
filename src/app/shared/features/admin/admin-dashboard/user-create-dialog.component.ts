import {Component} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {UserRole} from "../../../../core/models/user.model";

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Create New User</h2>
    <form [formGroup]="createForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="createForm.get('name')?.errors?.['required']">Name is required</mat-error>
          <mat-error *ngIf="createForm.get('name')?.errors?.['minlength']">Name must be at least 2 characters</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error *ngIf="createForm.get('email')?.errors?.['required']">Email is required</mat-error>
          <mat-error *ngIf="createForm.get('email')?.errors?.['email']">Please enter a valid email address</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Age</mat-label>
          <input matInput formControlName="age" type="number">
          <mat-error *ngIf="createForm.get('age')?.errors?.['required']">Age is required</mat-error>
          <mat-error *ngIf="createForm.get('age')?.errors?.['min']">Age must be at least 18</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Monthly Income</mat-label>
          <input matInput formControlName="monthlyIncome" type="number">
          <mat-error *ngIf="createForm.get('monthlyIncome')?.errors?.['required']">Monthly income is required</mat-error>
          <mat-error *ngIf="createForm.get('monthlyIncome')?.errors?.['min']">Monthly income must be positive</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Credit Score</mat-label>
          <input matInput formControlName="creditScore" type="number">
          <mat-error *ngIf="createForm.get('creditScore')?.errors?.['required']">Credit score is required</mat-error>
          <mat-error *ngIf="createForm.get('creditScore')?.errors?.['min']">Credit score must be at least 300</mat-error>
          <mat-error *ngIf="createForm.get('creditScore')?.errors?.['max']">Credit score cannot exceed 850</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option *ngFor="let role of roles" [value]="role">
              {{role}}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="createForm.get('role')?.errors?.['required']">Role is required</mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="createForm.get('password')?.hasError('required')">Password is required</mat-error>
          <mat-error *ngIf="createForm.get('password')?.hasError('pattern')">
            Password must contain at least one digit, uppercase, lowercase letter and special character
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!createForm.valid">
          Create
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class UserCreateDialogComponent {
  createForm: FormGroup;
  roles = Object.values(UserRole);

  constructor(
    public dialogRef: MatDialogRef<UserCreateDialogComponent>,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(18)]],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      creditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]],
      role: [UserRole.USER, Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$')
      ]]
    });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      this.dialogRef.close(this.createForm.value);
    }
  }
}
