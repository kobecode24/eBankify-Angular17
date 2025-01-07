// account.service.spec.ts
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AccountService } from "./account.service";
import { AccountResponse, AccountStatus } from "../models/account.model";
import { environment } from "../../../environments/environment";

describe("AccountService", () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: {} as any }
        ])
      ],
      providers: [AccountService]
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should load user accounts", (done) => {
    const mockAccounts: AccountResponse[] = [
      {
        accountId: 1,
        balance: 1000,
        status: AccountStatus.ACTIVE,
        userId: 1,
        userName: "Test User",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        accountId: 2,
        balance: 2000,
        status: AccountStatus.ACTIVE,
        userId: 1,
        userName: "Test User",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    service.loadUserAccounts(1).subscribe({
      next: (response) => {
        // Wait for signal updates to propagate
        setTimeout(() => {
          const accounts = service.accounts();
          expect(accounts.length).toBe(2);
          expect(accounts[0].accountId).toBe(1);
          expect(service.totalBalance()).toBe(3000);
          done();
        }, 0);
      },
      error: (error) => done.fail(error)
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/accounts/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAccounts);
  });
});
