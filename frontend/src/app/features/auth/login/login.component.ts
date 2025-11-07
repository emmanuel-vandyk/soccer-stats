import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Login</h1>
          <p>Enter your credentials to access</p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
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
            [disabled]="isLoading() || loginForm.invalid"
          >
            @if (isLoading()) {
              Loading Session ...
            } @else {
               Login
            }
          </button>


        @if (errorMessage()) {
          <div class="alert alert-error">
            {{ errorMessage() }}
          </div>
        }

          <!-- Demo Credentials Info -->
        <div class="test-credentials">
          <div class="test-header">
            <strong>Demo Credentials</strong>
          </div>
          <div class="test-users">
            <div class="test-user">
              <span class="test-label">Email:</span>
              <code>demo@<!-- -->example.com</code>
            </div>
            <div class="test-user">
              <span class="test-label">Password:</span>
              <code>Demo123456</code>
            </div>
          </div>
        </div>

          <!-- Test Credentials Info -->
        <div class="test-credentials">
          <div class="test-header">
            <strong>Test Credentials</strong>
          </div>
          <div class="test-users">
            <div class="test-user">
              <span class="test-label">Email:</span>
              <code>test@<!-- -->example.com</code>
            </div>
            <div class="test-user">
              <span class="test-label">Password:</span>
              <code>Test123456</code>
            </div>
          </div>
        </div>
        </form>

        <div class="auth-footer">
          <p>
            ¿Don't have an account?
            <a routerLink="/auth/register" class="link">Register</a>
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

    .test-credentials {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #bae6fd;
      border-radius: 12px;
      padding: 16px;
      margin: 24px 0;

      .test-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: #0369a1;
        font-size: 14px;

        .test-icon {
          font-size: 18px;
        }
      }

      .test-users {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .test-user {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        .test-label {
          color: #075985;
          font-weight: 500;
          min-width: 70px;
        }

        code {
          background: white;
          color: #0c4a6e;
          padding: 4px 10px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          border: 1px solid #bae6fd;
          user-select: all;
          cursor: pointer;

          &:hover {
            background: #f0f9ff;
          }
        }
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
          width: 90%;
          padding: 12px 20px;
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

      .link {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
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

      .test-credentials {
        padding: 14px;
        margin-bottom: 20px;

        .test-header {
          font-size: 13px;
          margin-bottom: 10px;

          .test-icon {
            font-size: 16px;
          }
        }

        .test-user {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;

          .test-label {
            min-width: auto;
          }

          code {
            width: 100%;
            text-align: center;
          }
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
            width: 100%;
            padding: 12px 16px;
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
            padding: 11px 14px;
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
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        const redirectUrl = this.authService.redirectUrl || '/players';
        this.authService.redirectUrl = null;
        this.router.navigate([redirectUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Email o contraseña incorrectos');
      }
    });
  }
}
