import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // MODIFIED: Imported withInterceptors function hook
import { routes } from './app.routes'; 
import { jwtInterceptor } from './core/jwt.interceptor'; // ADDED: Imported our newly built functional interceptor script

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), // This makes your app.routes.ts active globally
    
    // MODIFIED: Attached our JWT Interceptor directly to the application network pipeline
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};