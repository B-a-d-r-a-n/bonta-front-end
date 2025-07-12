import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { StorageUtils } from '@shared/utils/storage.utils';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const token = StorageUtils.getLocalItem<string>(STORAGE_KEYS.AUTH_TOKEN);

  // Debug logging for authentication endpoints
  if (request.url.includes('/api/Authentication/')) {
    console.log('AuthInterceptor - URL:', request.url);
    console.log('AuthInterceptor - Token present:', !!token);
    if (token) {
      console.log('AuthInterceptor - Token length:', token.length);
      console.log(
        'AuthInterceptor - Token starts with:',
        token.substring(0, 20) + '...'
      );
    }
  }

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request);
}
