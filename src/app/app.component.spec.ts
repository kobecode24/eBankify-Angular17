import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './core/services/auth.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['initializeAuthentication'], {
      router: jasmine.createSpyObj('Router', ['navigate'])
    });
    authServiceSpy.initializeAuthentication.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize authentication on startup', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(authServiceSpy.initializeAuthentication).toHaveBeenCalled();
  });

  it('should redirect to login when authentication fails', () => {
    authServiceSpy.initializeAuthentication.and.returnValue(of(false));
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(authServiceSpy.router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
