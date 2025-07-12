export interface ErrorDetails {
  statusCode: number;
  errorMessage: string;
  errors?: string[];
}

export interface ValidationErrorResponse {
  statusCode: number;
  errorMessage: string;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  field: string;
  errors: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface NetworkError {
  status: number;
  statusText: string;
  message: string;
}
