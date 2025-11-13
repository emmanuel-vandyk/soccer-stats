import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../config/environment';
import { ApiResponse, PaginatedResponse } from '../models';

/**
 * Base service for API communication
 * Handles communication with the backend and parameter conversion
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private readonly REQUEST_TIMEOUT = 30000; // 30 segundos (backend optimizado)

  /**
   * Headers for avoiding HTTP cache
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  /**
   * GET generic request with error handling
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<ApiResponse<T>> {
    const httpParams = this.buildParams(params);
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🔵 API GET Request:', { url, params: httpParams.toString() });

    return this.http.get<ApiResponse<T>>(url, {
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(() => ('✅ GET Response received')),
      catchError(this.handleError)
    );
  }

  /**
   * GET request for responses with pagination
   */
  getPaginated<T>(endpoint: string, params?: Record<string, any>): Observable<PaginatedResponse<T>> {
    const httpParams = this.buildParams(params);
    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = Date.now();
    console.log(`🔵 [${timestamp}] API Paginated Request:`, { url, params: httpParams.toString() });

    return this.http.get<PaginatedResponse<T>>(url, {
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(response => {
        const elapsed = Date.now() - timestamp;
        console.log(`✅ [${timestamp}] Paginated Response received in ${elapsed}ms:`, {
          total: response.pagination?.total,
          itemsCount: Array.isArray(response.data) ? response.data.length : 0
        });
      }),
      catchError((error) => {
        const elapsed = Date.now() - timestamp;
        console.error(`❌ [${timestamp}] Request failed after ${elapsed}ms:`, error);
        return this.handleError(error);
      })
    );
  }

  /**
   * POST generic requests
   */
  post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<ApiResponse<T>>(url, body)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError(this.handleError)
      );
  }

  /**
   * PUT generic requests
   */
  put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE generic requests
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET request for blob data (files, exports, etc.)
   * Returns blob response for file downloads
   * Uses raw params without camelCase to kebab-case conversion
   */
  getBlob(endpoint: string, params?: Record<string, any>): Observable<Blob> {
    const httpParams = this.buildParamsRaw(params);
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob',
      // Note: Authentication headers are automatically added by authInterceptor
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap(() => ('✅ Blob Response received')),
      catchError(this.handleError)
    );
  }

  /**
   * Construye HttpParams desde un objeto SIN conversión a kebab-case
   * Para endpoints que esperan parámetros en camelCase (como /api/players/export)
   */
  private buildParamsRaw(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  /**
   * Construye HttpParams desde un objeto
   * IMPORTANTE: Convierte camelCase a kebab-case para el backend
   */
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      // Ignorar valores null, undefined o string vacío
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Convertir camelCase a kebab-case para el backend
      const kebabKey = this.camelToKebab(key);
      httpParams = httpParams.set(kebabKey, String(value));
    });

    return httpParams;
  }

  /**
   * Convierte camelCase a kebab-case
   */
  private camelToKebab(str: string): string {
    return str
      .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
      .replace(/^-/, ''); // Remover guion inicial si existe
  }

  /**
   * Centralized error handling for HTTP
   */
  private handleError(error: HttpErrorResponse | any): Observable<never> {
    let errorMessage = 'An error occurred';

    console.error('Full HTTP Error:', error);

    // Timeout error
    if (error.name === 'TimeoutError') {
      errorMessage = `Request took more than ${this.REQUEST_TIMEOUT / 1000} seconds. Check backend connection.`;
      console.error(`Timeout error - Request exceeded ${this.REQUEST_TIMEOUT / 1000} seconds`);
      return throwError(() => new Error(errorMessage));
    }

    // HTTP Error Response
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Client Error: ${error.error.message}`;
        console.error('Client-side error:', error.error);
      } else if (error.status === 0) {
        // Error de red o CORS
        errorMessage = 'Cannot connect to server. Verify that backend is running on http://localhost:3000';
        console.error('Network error - Backend not responding or CORS blocked');
      } else if (error.status === 404) {
        errorMessage = `Endpoint not found: ${error.url}`;
        console.error('404 Not Found:', error.url);
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
        console.error('Server error 5xx:', error);
      } else {
        // Error del servidor con mensaje
        if (error.error?.error?.message) {
          errorMessage = error.error.error.message;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
        console.error('Server error:', error.status, error.error);
      }
    }

    console.error('Error message to user:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
