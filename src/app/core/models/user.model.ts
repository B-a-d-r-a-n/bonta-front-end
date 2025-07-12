export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  userName: string;
  phoneNumber?: string;
}

export interface UserResponse {
  email: string;
  displayName: string;
  token: string;
}

export interface EmailCheckRequest {
  email: string;
}

export interface EmailCheckResponse {
  emailExists: boolean;
}

export interface CurrentUserResponse {
  email: string;
  displayName: string;
}
