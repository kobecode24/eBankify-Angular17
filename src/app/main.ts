// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {HttpClientModule, provideHttpClient} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import {AppComponent} from "./app.component";
import {routes} from "./app.routes";
import {importProvidersFrom} from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations()
  ]
}).catch(err => console.error('Error bootstrapping app:', err));
