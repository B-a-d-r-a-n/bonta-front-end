import { APP_CONSTANTS } from '../../core/constants/app-constants';

export class ValidationUtils {
  // Email validation
  static isValidEmail(email: string): boolean {
    return APP_CONSTANTS.EMAIL_REGEX.test(email);
  }

  // Password validation
  static isValidPassword(password: string): boolean {
    return password.length >= APP_CONSTANTS.PASSWORD_MIN_LENGTH;
  }

  // Required field validation
  static isRequired(value: any): boolean {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ''
    );
  }

  // String length validation
  static isValidLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  // Number range validation
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Phone number validation (basic)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Postal code validation (US format)
  static isValidPostalCode(postalCode: string): boolean {
    const postalRegex = /^\d{5}(-\d{4})?$/;
    return postalRegex.test(postalCode);
  }

  // Credit card validation (Luhn algorithm)
  static isValidCreditCard(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleanNumber)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Form validation helpers
  static getFieldError(
    fieldName: string,
    value: any,
    rules: ValidationRule[]
  ): string | null {
    for (const rule of rules) {
      const error = rule.validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  }

  static validateForm(
    formData: any,
    validationRules: Record<string, ValidationRule[]>
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const error = this.getFieldError(fieldName, formData[fieldName], rules);
      if (error) {
        errors[fieldName] = error;
      }
    }

    return errors;
  }

  // Common validation rules
  static readonly RULES = {
    required: (value: any) =>
      !this.isRequired(value) ? 'This field is required' : null,
    email: (value: string) =>
      !this.isValidEmail(value) ? 'Please enter a valid email address' : null,
    password: (value: string) =>
      !this.isValidPassword(value)
        ? `Password must be at least ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} characters`
        : null,
    minLength: (min: number) => (value: string) =>
      !this.isValidLength(value, min, Infinity)
        ? `Must be at least ${min} characters`
        : null,
    maxLength: (max: number) => (value: string) =>
      !this.isValidLength(value, 0, max)
        ? `Must be no more than ${max} characters`
        : null,
    phone: (value: string) =>
      !this.isValidPhone(value) ? 'Please enter a valid phone number' : null,
    postalCode: (value: string) =>
      !this.isValidPostalCode(value)
        ? 'Please enter a valid postal code'
        : null,
    creditCard: (value: string) =>
      !this.isValidCreditCard(value)
        ? 'Please enter a valid credit card number'
        : null,
  };
}

export interface ValidationRule {
  validator: (value: any) => string | null;
}
