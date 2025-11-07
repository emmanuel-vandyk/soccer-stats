import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

/**
 * Servicio de caché para optimizar requests repetitivos
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos por defecto

  /**
   * Almacenar datos en caché
   */
  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    });
  }

  /**
   * Obtener datos del caché
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Verificar si expiró
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Verificar si existe en caché y es válido
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Eliminar entrada específica
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpiar entradas expiradas
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtener tamaño del caché
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Invalidar caché por patrón
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    (`🧹 Cache cleared for pattern "${pattern}": ${keysToDelete.length} entries removed`);
  }

  /**
   * Limpiar caché de top rated players específicamente
   */
  clearTopRatedCache(): void {
    this.invalidatePattern('top_rated');
  }
}
