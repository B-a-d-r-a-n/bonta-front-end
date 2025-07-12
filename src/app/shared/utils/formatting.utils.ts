export class FormattingUtils {
  // Currency formatting
  static formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Number formatting
  static formatNumber(
    value: number,
    locale: string = 'en-US',
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(locale, options).format(value);
  }

  // Percentage formatting
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  // Date formatting
  static formatDate(
    date: Date | string,
    options?: Intl.DateTimeFormatOptions,
    locale: string = 'en-US'
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  }

  // Relative time formatting
  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

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

    return this.formatDate(dateObj, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // File size formatting
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Phone number formatting
  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    return phone;
  }

  // Credit card number formatting
  static formatCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})(\d{4})$/);

    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return cardNumber;
  }

  // Truncate text
  static truncateText(
    text: string,
    maxLength: number,
    suffix: string = '...'
  ): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  // Capitalize first letter
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Title case
  static titleCase(text: string): string {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Slugify text
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
