import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { injectMutation } from '@tanstack/angular-query-experimental';

import { UserQueries } from '../../queries/user.queries';
import { LoginRequest, UserResponse } from '@core/models';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private userQueries = inject(UserQueries);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loginMutation = injectMutation(() => this.userQueries.login());

  // Computed signals for template usage
  isLoginPending = computed(() => this.loginMutation.isPending());
  loginError = computed(() => this.loginMutation.error());

  // Helper method for form validation
  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const request: LoginRequest = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!,
      };

      this.loginMutation.mutate(request, {
        onSuccess: (user: UserResponse) => {
          this.authService.setAuthState(user);
          this.router.navigate(['/']);
        },
        onError: (error: any) => {
          console.error('Login failed:', error);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
