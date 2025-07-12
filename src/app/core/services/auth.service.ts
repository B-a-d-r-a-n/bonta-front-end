import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';
import {
  UserResponse,
  LoginRequest,
  RegisterRequest,
  CurrentUserResponse,
  EmailCheckRequest,
  EmailCheckResponse,
} from '../models/user.model';
import { AddressDTO } from '../models/address.model';
import { StorageUtils } from '@shared/utils/storage.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSource = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSource.asObservable();

  // Signals for component state
  public isAuthenticated = signal(false);
  public isLoading = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadCurrentUser();
  }

  setAuthState(user: UserResponse): void {
    this.setCurrentUser(user);
  }

  login(loginRequest: LoginRequest): Observable<UserResponse> {
    this.isLoading.set(true);
    return this.http
      .post<UserResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
        loginRequest
      )
      .pipe(
        map((response: UserResponse) => {
          this.setCurrentUser(response);
          this.isLoading.set(false);
          return response;
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<UserResponse> {
    this.isLoading.set(true);
    return this.http
      .post<UserResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
        registerRequest
      )
      .pipe(
        map((response: UserResponse) => {
          this.setCurrentUser(response);
          this.isLoading.set(false);
          return response;
        })
      );
  }

  logout(): void {
    StorageUtils.removeLocalItem(STORAGE_KEYS.AUTH_TOKEN);
    StorageUtils.removeLocalItem(STORAGE_KEYS.CURRENT_USER);
    this.currentUserSource.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  checkEmailExists(email: string): Observable<EmailCheckResponse> {
    const request: EmailCheckRequest = { email };
    return this.http.get<EmailCheckResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.EMAIL_CHECK}`,
      {
        params: { email },
      }
    );
  }

  getCurrentUser(): Observable<CurrentUserResponse> {
    return this.http.get<CurrentUserResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.CURRENT_USER}`
    );
  }

  getUserAddress(): Observable<AddressDTO> {
    return this.http.get<AddressDTO>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.ADDRESS}`
    );
  }

  updateUserAddress(address: AddressDTO): Observable<AddressDTO> {
    return this.http.put<AddressDTO>(
      `${environment.apiUrl}${API_ENDPOINTS.AUTH.ADDRESS}`,
      address
    );
  }

  private setCurrentUser(user: UserResponse): void {
    StorageUtils.setLocalItem(STORAGE_KEYS.AUTH_TOKEN, user.token);
    StorageUtils.setLocalItem(STORAGE_KEYS.CURRENT_USER, user);
    this.currentUserSource.next(user);
    this.isAuthenticated.set(true);
  }

  private loadCurrentUser(): void {
    const token = StorageUtils.getLocalItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const user = StorageUtils.getLocalItem<UserResponse>(
      STORAGE_KEYS.CURRENT_USER
    );

    if (token && user) {
      this.currentUserSource.next(user);
      this.isAuthenticated.set(true);
    }
  }

  getToken(): string | null {
    return StorageUtils.getLocalItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
