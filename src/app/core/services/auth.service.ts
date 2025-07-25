import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { UserResponse, LoginRequest, RegisterRequest } from '@core/models';
import { StorageUtils } from '@shared/utils/storage.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // --- STATE: Use a WritableSignal for the user state ---
  private currentUserSignal: WritableSignal<UserResponse | null> = signal(null);

  // --- PUBLIC API: Expose state via computed signals ---
  public currentUser = this.currentUserSignal.asReadonly(); // Read-only version for consumers
  public isAuthenticated = computed(() => !!this.currentUserSignal()); // True if user is not null

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  // --- ACTIONS ---

  private loadUserFromStorage(): void {
    if (StorageUtils.isBrowser()) {
      const user = StorageUtils.getLocalItem<UserResponse>(
        STORAGE_KEYS.CURRENT_USER
      );
      if (user && user.token) {
        this.currentUserSignal.set(user);
      }
    }
  }

  // Use async/await for cleaner promise-based logic
  async login(loginRequest: LoginRequest): Promise<UserResponse> {
    const user = await lastValueFrom(
      this.http.post<UserResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
        loginRequest
      )
    );
    this.setAuthState(user);
    return user;
  }

  async register(registerRequest: RegisterRequest): Promise<UserResponse> {
    const user = await lastValueFrom(
      this.http.post<UserResponse>(
        `${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
        registerRequest
      )
    );
    this.setAuthState(user);
    return user;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    StorageUtils.removeLocalItem(STORAGE_KEYS.AUTH_TOKEN);
    StorageUtils.removeLocalItem(STORAGE_KEYS.CURRENT_USER);
    this.router.navigate(['/']);
  }

  // Helper to set state and localStorage
  private setAuthState(user: UserResponse): void {
    this.currentUserSignal.set(user);
    StorageUtils.setLocalItem(STORAGE_KEYS.CURRENT_USER, user);
    StorageUtils.setLocalItem(STORAGE_KEYS.AUTH_TOKEN, user.token);
  }

  // --- UTILITIES (for guards or interceptors) ---
  isLoggedIn(): boolean {
    return !!StorageUtils.getLocalItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}
