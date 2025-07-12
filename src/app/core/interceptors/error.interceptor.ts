import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

export function errorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error, router, toastService);
      return throwError(() => error);
    })
  );
}

function handleError(
  error: HttpErrorResponse,
  router: Router,
  toastService: ToastService
): void {
  switch (error.status) {
    case 401:
      handleUnauthorized(router, toastService);
      break;
    case 403:
      handleForbidden(toastService);
      break;
    case 404:
      handleNotFound(toastService);
      break;
    case 422:
      handleValidationError(error, toastService);
      break;
    case 500:
      handleServerError(toastService);
      break;
    default:
      handleGenericError(error, toastService);
      break;
  }
}

function handleUnauthorized(router: Router, toastService: ToastService): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  toastService.showError('Authentication Error', 'Please log in again.');
  const currentUrl = router.url;
  if (currentUrl !== '/user/login' && currentUrl !== '/user/register') {
    router.navigate(['/user/login']);
  }
}

function handleForbidden(toastService: ToastService): void {
  toastService.showError(
    'Access Denied',
    'You do not have permission to perform this action.'
  );
}

function handleNotFound(toastService: ToastService): void {
  toastService.showError('Not Found', 'The requested resource was not found.');
}

function handleValidationError(
  error: HttpErrorResponse,
  toastService: ToastService
): void {
  const validationErrors = error.error?.errors;
  if (validationErrors) {
    const errorMessages = Object.values(validationErrors).flat() as string[];
    toastService.showValidationError(errorMessages);
  } else {
    toastService.showError(
      'Validation Error',
      'Please check your input and try again.'
    );
  }
}

function handleServerError(toastService: ToastService): void {
  toastService.showError(
    'Server Error',
    'An internal server error occurred. Please try again later.'
  );
}

function handleGenericError(
  error: HttpErrorResponse,
  toastService: ToastService
): void {
  if (error.status === 0) {
    toastService.showNetworkError();
  } else {
    const message = error.error?.message || 'An unexpected error occurred';
    toastService.showError('Error', message);
  }
}
