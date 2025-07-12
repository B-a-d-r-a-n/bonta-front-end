import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { injectMutation } from '@tanstack/angular-query-experimental';

import { UserQueries } from '../../queries/user.queries';
import { RegisterRequest, UserResponse } from '@core/models';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
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
    ProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private userQueries = inject(UserQueries);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: [''],
    },
    { validators: this.passwordMatchValidator }
  );

  registerMutation = injectMutation(() => this.userQueries.register());
  checkEmailMutation = injectMutation(() => this.userQueries.checkEmail());

  emailChecked = signal(false);

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return control
      ? control.invalid && (control.touched || control.dirty)
      : false;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password &&
      confirmPassword &&
      password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  checkEmailAvailability(): void {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.valid && emailControl.value) {
      this.emailChecked.set(true);
      this.checkEmailMutation.mutate(emailControl.value);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const request: RegisterRequest = this.registerForm.value;
      this.registerMutation.mutate(request, {
        onSuccess: (user: UserResponse) => {
          this.authService.setAuthState(user);
          this.router.navigate(['/']);
        },
        onError: (error: any) => {
          console.error('Registration failed:', error);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
