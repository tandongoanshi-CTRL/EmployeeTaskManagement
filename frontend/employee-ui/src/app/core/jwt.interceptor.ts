import { HttpInterceptorFn } from '@angular/common/http';

// ADDED: Modern Functional HTTP Interceptor for standalone configuration applications
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Grab token dynamically from local storage cache
  const token = localStorage.getItem('access_token');

  // If token exists, clone request and insert Authorization Header seamlessly
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};