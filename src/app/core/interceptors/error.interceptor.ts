import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export function errorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(request).pipe(
    // Optional: Add a retry strategy for failed GET requests
    retry({
      count: 1,
      delay: (error, retryCount) => {
        // Only retry on network errors or 5xx server errors, not on 4xx client errors
        if (error.status >= 500 || error.status === 0) {
          return new Observable((subscriber) =>
            subscriber.next(retryCount * 1000)
          );
        }
        return throwError(() => error);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `A client-side error occurred: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code.
        switch (error.status) {
          case 400: // Bad Request
            // This could be a validation error. Let the component handle it if possible.
            errorMessage =
              error.error?.errorMessage ||
              'Invalid request. Please check your input.';
            break;
          case 401: // Unauthorized
            errorMessage = 'Authentication failed. Please log in again.';
            authService.logout(); // Log out the user
            break;
          case 404: // Not Found
            // Don't show a toast for every 404, as it's often an expected state (e.g., basket not found).
            // The component's query.isError state should handle this.
            console.warn(`Resource not found: ${request.urlWithParams}`);
            // We still re-throw the error so TanStack Query knows it failed.
            return throwError(() => error);
          case 500: // Internal Server Error
            errorMessage = 'A server error occurred. Please try again later.';
            break;
        }
      }

      // Show a toast for critical, user-facing errors
      if (error.status !== 404) {
        toastService.showError('Error', errorMessage);
      }

      // **THIS IS THE CRUCIAL FIX**
      // We re-throw the original error object so that downstream consumers
      // like TanStack Query's `onError` callback receive the full context.
      return throwError(() => error);
    })
  );
}
