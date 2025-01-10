import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { environment } from "../../../environments/environment";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";
import { UserRole } from "../models/user.model";

describe("AuthService", () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, TokenService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should authenticate user and store token on login", () => {
    const mockResponse = {
      token: "eyJhbGciOiJIUzI1NiJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiJ9...",
      user: {
        userId: 2,
        email: "admin-secondary@example.com",
        name: "Admin Secondary",
        role: UserRole.ADMIN,
        age: 30,
        monthlyIncome: 5000,
        creditScore: 750,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    service.login({ email: "admin-secondary@example.com", password: "Test123#!" })
      .subscribe(response => {
        expect(response).toEqual(jasmine.objectContaining({
          userId: mockResponse.user.userId,
          email: mockResponse.user.email,
          name: mockResponse.user.name,
          role: mockResponse.user.role
        }));
        expect(tokenService.getAccessToken()).toBe(mockResponse.token);
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe("POST");
    req.flush(mockResponse);
  });
});
