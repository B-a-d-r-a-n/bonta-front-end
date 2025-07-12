import { Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'success' | 'error' | 'warn' | 'info';

export interface ToastMessage {
  severity: ToastSeverity;
  summary: string;
  detail: string;
  key?: string;
  life?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public isVisible = signal(false);

  constructor(private messageService: MessageService) {}

  showSuccess(summary: string, detail: string, key: string = 'global'): void {
    this.showMessage({
      severity: 'success',
      summary,
      detail,
      key,
      life: 3000,
    });
  }

  showError(summary: string, detail: string, key: string = 'global'): void {
    this.showMessage({
      severity: 'error',
      summary,
      detail,
      key,
      life: 5000,
    });
  }

  showWarning(summary: string, detail: string, key: string = 'global'): void {
    this.showMessage({
      severity: 'warn',
      summary,
      detail,
      key,
      life: 4000,
    });
  }

  showInfo(summary: string, detail: string, key: string = 'global'): void {
    this.showMessage({
      severity: 'info',
      summary,
      detail,
      key,
      life: 3000,
    });
  }

  private showMessage(message: ToastMessage): void {
    this.messageService.add(message);
    this.isVisible.set(true);
  }

  clear(key?: string): void {
    this.messageService.clear(key);
    this.isVisible.set(false);
  }

  // Convenience methods for common scenarios
  showApiError(error: any, context: string = 'Operation'): void {
    const message = error?.message || 'An unexpected error occurred';
    this.showError(`${context} Failed`, message);
  }

  showNetworkError(): void {
    this.showError(
      'Network Error',
      'Please check your internet connection and try again.'
    );
  }

  showValidationError(errors: string[]): void {
    const message = errors.join(', ');
    this.showError('Validation Error', message);
  }

  showLoadingMessage(message: string = 'Loading...'): void {
    this.showInfo('Please Wait', message);
  }
}
