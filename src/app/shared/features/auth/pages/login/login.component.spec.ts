import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../../core/services/auth.service';
import { TokenService } from '../../../../../core/services/token.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { User, UserRole } from '../../../../../core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let tokenService: jasmine.SpyObj<TokenService>;

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    age: 30,
    monthlyIncome: 5000,
    creditScore: 750,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'getCurrentUser'], {
      router: jasmine.createSpyObj('Router', ['navigate'])
    });
    tokenService = jasmine.createSpyObj('TokenService', ['getAccessToken', 'isTokenExpired']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: TokenService, useValue: tokenService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    tokenService.getAccessToken.and.returnValue(null);
    tokenService.isTokenExpired.and.returnValue(true);
    authService.getCurrentUser.and.returnValue(of(null));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message on login failure', fakeAsync(() => {
    const credentials = {
      email: 'test@example.com',
      password: 'Test123#!'
    };

    authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

    component.loginForm.setValue(credentials);
    component.onSubmit();
    tick();

    expect(component.loginError).toBe('Invalid email or password');
    expect(component.isLoading).toBeFalse();
  }));
});
