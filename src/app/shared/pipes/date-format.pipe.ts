import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: string | Date,
    format: string = 'medium',
    locale: string = 'en-US'
  ): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return '';
    }

    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(date);

      case 'long':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);

      case 'time':
        return new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);

      case 'relative':
        return this.getRelativeTimeString(date);

      default: // medium
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
    }
  }

  private getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return this.transform(date, 'short');
  }
}
