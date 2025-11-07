import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  show(type: ToastMessage['type'], message: string, duration = 5000): void {
    this.toastSubject.next({ type, message, duration });
  }

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
