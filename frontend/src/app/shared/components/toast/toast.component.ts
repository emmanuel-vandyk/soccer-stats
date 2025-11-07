import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast"
          [class.success]="toast.type === 'success'"
          [class.error]="toast.type === 'error'"
          [class.info]="toast.type === 'info'"
          [class.warning]="toast.type === 'warning'">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                </svg>
              }
              @case ('error') {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
                </svg>
              }
              @case ('info') {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
                </svg>
              }
              @case ('warning') {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
                </svg>
              }
            }
          </div>
          <div class="toast-content">
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" (click)="removeToast(toast.id)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      color: #060606;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      min-width: 320px;
      animation: slideIn 0.3s ease-out;
      color: #060606;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast.success {
      border-color: #10b981;

      .toast-icon {
        color: #10b981;
      }
    }

    .toast.error {
      border-color: #ef4444;

      .toast-icon {
        color: #ef4444;
      }
    }

    .toast.info {
      border-color: #3b82f6;

      .toast-icon {
        color: #3b82f6;
      }
    }

    .toast.warning {
      border-color: #f59e0b;

      .toast-icon {
        color: #f59e0b;
      }
    }

    .toast-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-top: 2px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .toast-content {
      flex: 1;
      color: #060606;
    }

    .toast-message {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #060606 !important;
      line-height: 1.5;
    }

    .toast-close {
      width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      background: none;
      color: #060606;
      cursor: pointer;
      flex-shrink: 0;
      transition: color 0.2s;

      &:hover {
        color: #111827;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        min-width: 0;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  ngOnInit(): void {
    // Suscribirse a los mensajes del servicio
    this.toastService.toast$.subscribe(message => {
      this.show(message.type, message.message, message.duration);
    });
  }

  show(type: Toast['type'], message: string, duration = 5000): void {
    const toast: Toast = {
      id: this.nextId++,
      type,
      message,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  // Helper methods
  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }
}
