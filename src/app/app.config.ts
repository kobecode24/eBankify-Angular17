import {ApplicationConfig, importProvidersFrom, isDevMode} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {MatIconModule} from "@angular/material/icon";
import {provideAnimations} from "@angular/platform-browser/animations";
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {cartReducer} from "./core/store/reducers/cart.reducer";
import {CartEffects} from "./core/store/effects/cart.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({
      cart: cartReducer
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideAnimations(),
    importProvidersFrom(MatIconModule),
    provideStore({
      cart: cartReducer
    }),
    provideEffects(CartEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
]
};
