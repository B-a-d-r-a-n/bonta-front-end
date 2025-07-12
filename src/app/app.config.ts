import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  InjectionToken,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideQueryClient,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import Aura from '@primeuix/themes/aura';
import { environment } from '../environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

export const API_URL = new InjectionToken<string>('API_URL');
export const STRIPE_PUBLISHABLE_KEY = new InjectionToken<string>(
  'STRIPE_PUBLISHABLE_KEY'
);
export const APP_NAME = new InjectionToken<string>('APP_NAME');
export const APP_VERSION = new InjectionToken<string>('APP_VERSION');
export const DEBUG = new InjectionToken<boolean>('DEBUG');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,

      retry: 3,
    },
  },
});
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
      },
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    MessageService,
    ConfirmationService,
    provideQueryClient(queryClient),
    provideClientHydration(withEventReplay()),
    { provide: API_URL, useValue: environment.apiUrl },
    {
      provide: STRIPE_PUBLISHABLE_KEY,
      useValue: environment.stripePublishableKey,
    },
    { provide: APP_NAME, useValue: environment.appName },
    { provide: APP_VERSION, useValue: environment.version },
    { provide: DEBUG, useValue: environment.debug },
  ],
};
