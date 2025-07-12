import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  UserResponse,
  LoginRequest,
  RegisterRequest,
  CurrentUserResponse,
  EmailCheckRequest,
  EmailCheckResponse,
  AddressDTO,
  ErrorDetails,
} from '@core/models';
import { API_URL } from 'app/app.config';
import { StorageUtils } from '@shared/utils/storage.utils';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class UserQueries {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClient);
  private apiUrl = inject(API_URL);

  // Query keys
  private static readonly CURRENT_USER_KEY = ['currentUser'];
  private static readonly ADDRESS_KEY = ['address'];

  // Get current user
  getCurrentUser() {
    return {
      queryKey: UserQueries.CURRENT_USER_KEY,
      queryFn: () => this.fetchCurrentUser(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    };
  }

  // Get user address
  getAddress() {
    return {
      queryKey: UserQueries.ADDRESS_KEY,
      queryFn: () => this.fetchAddress(),
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    };
  }

  // Login mutation
  login() {
    return {
      mutationFn: (request: LoginRequest) => this.loginUser(request),
      onSuccess: (data: UserResponse) => {
        StorageUtils.setLocalItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        StorageUtils.setLocalItem(STORAGE_KEYS.CURRENT_USER, data);
        this.queryClient.invalidateQueries({
          queryKey: UserQueries.CURRENT_USER_KEY,
        });
      },
      onError: (error: ErrorDetails) => {
        console.error('Login failed:', error.errorMessage);
      },
      retry: 1,
    };
  }

  // Register mutation
  register() {
    return {
      mutationFn: (request: RegisterRequest) => this.registerUser(request),
      onSuccess: (data: UserResponse) => {
        StorageUtils.setLocalItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        StorageUtils.setLocalItem(STORAGE_KEYS.CURRENT_USER, data);
        this.queryClient.invalidateQueries({
          queryKey: UserQueries.CURRENT_USER_KEY,
        });
      },
      onError: (error: ErrorDetails) => {
        console.error('Registration failed:', error.errorMessage);
      },
      retry: 1,
    };
  }

  // Check email mutation
  checkEmail() {
    return {
      mutationFn: (email: string) => this.checkEmailExists(email),
      onError: (error: ErrorDetails) => {
        console.error('Email check failed:', error.errorMessage);
      },
      retry: 1,
    };
  }

  // Update address mutation
  updateAddress() {
    return {
      mutationFn: (address: AddressDTO) => this.updateUserAddress(address),
      onSuccess: () => {
        this.queryClient.invalidateQueries({
          queryKey: UserQueries.ADDRESS_KEY,
        });
      },
      onError: (error: ErrorDetails) => {
        console.error('Address update failed:', error.errorMessage);
      },
      retry: 3,
    };
  }

  // API methods
  private fetchCurrentUser(): Promise<UserResponse> {
    return lastValueFrom(
      this.http.get<UserResponse>(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.CURRENT_USER}`
      )
    );
  }

  private fetchAddress(): Promise<AddressDTO> {
    return lastValueFrom(
      this.http.get<AddressDTO>(`${this.apiUrl}${API_ENDPOINTS.AUTH.ADDRESS}`)
    );
  }

  private loginUser(request: LoginRequest): Promise<UserResponse> {
    return lastValueFrom(
      this.http.post<UserResponse>(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
        request
      )
    );
  }

  private registerUser(request: RegisterRequest): Promise<UserResponse> {
    return lastValueFrom(
      this.http.post<UserResponse>(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
        request
      )
    );
  }

  private checkEmailExists(email: string): Promise<boolean> {
    return lastValueFrom(
      this.http.get<boolean>(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.EMAIL_CHECK}`,
        {
          params: { email },
        }
      )
    );
  }

  private updateUserAddress(address: AddressDTO): Promise<AddressDTO> {
    return lastValueFrom(
      this.http.put<AddressDTO>(
        `${this.apiUrl}${API_ENDPOINTS.AUTH.ADDRESS}`,
        address
      )
    );
  }
}
