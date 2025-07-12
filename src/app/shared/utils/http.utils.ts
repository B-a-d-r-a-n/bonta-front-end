import { HttpHeaders, HttpParams } from '@angular/common/http';

export class HttpUtils {
  // Create headers
  static createHeaders(headers?: Record<string, string>): HttpHeaders {
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        httpHeaders = httpHeaders.set(key, value);
      });
    }

    return httpHeaders;
  }

  // Create authorization header
  static createAuthHeader(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Create params from object
  static createParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }

  // Build URL with query parameters
  static buildUrl(baseUrl: string, params?: Record<string, any>): string {
    if (!params) {
      return baseUrl;
    }

    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map(
              (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
            )
            .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
  }

  // Parse query string
  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  // Extract filename from Content-Disposition header
  static extractFilename(contentDisposition: string): string | null {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);

    if (matches != null && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }

    return null;
  }

  // Check if response is successful
  static isSuccessResponse(status: number): boolean {
    return status >= 200 && status < 300;
  }

  // Check if response is a client error
  static isClientError(status: number): boolean {
    return status >= 400 && status < 500;
  }

  // Check if response is a server error
  static isServerError(status: number): boolean {
    return status >= 500 && status < 600;
  }

  // Get error message from response
  static getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }

  // Retry logic
  static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }

  // Debounce function
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Cancelable request wrapper
  static createCancelableRequest<T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): { promise: Promise<T>; cancel: () => void } {
    const controller = new AbortController();

    return {
      promise: requestFn(controller.signal),
      cancel: () => controller.abort(),
    };
  }

  // Request timeout wrapper
  static withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      ),
    ]);
  }

  // Batch requests
  static async batchRequests<T>(
    requests: (() => Promise<T>)[],
    concurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = request().then((result) => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }
}
