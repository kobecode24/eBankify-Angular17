import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

export function setupTestModule(
  declarations: any[] = [],
  imports: any[] = [],
  providers: any[] = [],
) {
  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      NoopAnimationsModule,
      ...imports,
    ],
    declarations: [...declarations],
    providers: [...providers],
  });
}

export function createServiceFactory<T>(service: any) {
  setupTestModule([], [], [service]);
  return TestBed.inject(service) as T;
}
