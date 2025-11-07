import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../models';
import { STORAGE_KEYS } from '../models/constants';

/**
 * Servicio de autenticación con JWT
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Estado reactivo del usuario
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  // Signal para saber si está autenticado
  readonly isAuthenticated = signal(false);

  // Computed para acceder al usuario actual
  readonly currentUser = computed(() => {
    const user = this.currentUserSubject.value;
    return user;
  });

  // URL para redirección después del login
  redirectUrl: string | null = null;

  constructor() {
    this.checkAuthStatus();
  }

  /**
   * Verifica si hay una sesión activa al iniciar la app
   */
  private checkAuthStatus(): void {
    if (!this.isBrowser) return;

    const token = this.getToken();
    const userData = localStorage.getItem(STORAGE_KEYS.USER);

    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.clearSession();
      }
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('/auth/register', userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.apiService.get<User>('/auth/me').pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        }
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Guarda los datos de sesión
   */
  private setSession(authData: AuthResponse): void {
    if (!this.isBrowser) return;

    localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    this.currentUserSubject.next(authData.user);
    this.isAuthenticated.set(true);
  }

  /**
   * Limpia todos los datos de sesión
   */
  private clearSession(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Obtiene el token JWT actual
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si el usuario es admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === true;
  }

  /**
   * Decodifica el JWT token
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
