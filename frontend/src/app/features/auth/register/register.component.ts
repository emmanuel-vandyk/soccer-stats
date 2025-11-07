import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Complete the form to register</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              placeholder="My name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="tu@email.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="••••••••"
              class="form-input"
            />
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="isLoading() || registerForm.invalid"
          >
            @if (isLoading()) {
              Loading...
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Already have an account?
            <a routerLink="/auth/login" class="link">Login</a>
          </p>
          <p class="test-hint">
            💡 <strong>Tip:</strong> Use test credentials available on the login page for quick testing
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: url('/images/fif-worldcup-stadium.webp') top / cover no-repeat;
    }

    .auth-card {
      width: 100%;
      max-width: 450px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      padding: 40px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;

      h1 {
        font-size: 28px;
        font-weight: bold;
        color: #1f2937;
        margin: 0 0 8px 0;
      }

      p {
        color: #6b7280;
        margin: 0;
      }
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      &.alert-error {
        background: #fee;
        color: #dc2626;
        border: 1px solid #fecaca;
      }
    }

    .auth-form {
      .form-group {
        margin-bottom: 20px;

        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;

          &:focus {
            outline: none;
            border-color: #3b82f6;
          }
        }
      }

      .btn-submit {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 8px;
        background: #3b82f6;
        color: white;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #2563eb;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #6b7280;

      p {
        margin: 8px 0;
      }

      .link {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }

      .test-hint {
        font-size: 13px;
        color: #059669;
        background: #ecfdf5;
        padding: 8px 12px;
        border-radius: 8px;
        margin-top: 16px;
        border: 1px solid #a7f3d0;

        strong {
          color: #047857;
        }
      }
    }

    /* Tablet styles */
    @media (max-width: 768px) {
      .auth-container {
        padding: 16px;
      }

      .auth-card {
        max-width: 100%;
        padding: 32px 24px;
      }

      .auth-header {
        margin-bottom: 28px;

        h1 {
          font-size: 24px;
        }

        p {
          font-size: 14px;
        }
      }

      .auth-form {
        .form-group {
          margin-bottom: 18px;

          label {
            font-size: 15px;
            margin-bottom: 6px;
          }

          .form-input {
            padding: 12px 14px;
            font-size: 16px;
          }
        }

        .btn-submit {
          padding: 13px;
          font-size: 15px;
        }
      }

      .auth-footer {
        margin-top: 20px;
        font-size: 13px;
      }
    }

    /* Small mobile styles */
    @media (max-width: 480px) {
      .auth-container {
        padding: 12px;
      }

      .auth-card {
        padding: 28px 20px;
        border-radius: 12px;
      }

      .auth-header {
        margin-bottom: 24px;

        h1 {
          font-size: 22px;
        }
      }

      .alert {
        padding: 10px 14px;
        font-size: 13px;
        margin-bottom: 20px;
      }

      .auth-form {
        .form-group {
          margin-bottom: 16px;

          .form-input {
            padding: 11px 12px;
            font-size: 15px;
          }
        }

        .btn-submit {
          padding: 12px;
        }
      }
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, email, password } = this.registerForm.value;

    this.authService.register({
      username: username!,
      email: email!,
      password: password!
    }).subscribe({
      next: () => {
        this.router.navigate(['/players']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al registrar. Intenta nuevamente.');
      }
    });
  }
}
