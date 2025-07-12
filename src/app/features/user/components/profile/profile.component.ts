import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/models';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    MessageModule,
    ProgressSpinnerModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Query for user profile data
  profileQuery = injectQuery(() => ({
    queryKey: ['profile'],
    queryFn: () =>
      lastValueFrom(
        this.http.get<UserResponse>(
          `${environment.apiUrl}${API_ENDPOINTS.AUTH.CURRENT_USER}`
        )
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  }));

  editProfile(): void {
    // TODO: Navigate to edit profile page
    console.log('Edit profile clicked');
  }

  changePassword(): void {
    // TODO: Navigate to change password page
    console.log('Change password clicked');
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
  }

  enable2FA(): void {
    // TODO: Implement 2FA setup
    console.log('Enable 2FA clicked');
  }
}
