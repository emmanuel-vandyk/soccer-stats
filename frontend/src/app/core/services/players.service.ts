import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import {
  FifaPlayer,
  PlayerFilters,
  PlayerRadarStats,
  PlayerRadarStatsResponse,
  PlayerTimeline,
  PlayerFormData
} from '../models';
import { PaginatedResponse, ApiResponse } from '../models';

/**
 * Servicio para gestión de jugadores FIFA con caché
 */
@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  private readonly apiService = inject(ApiService);
  private readonly cacheService = inject(CacheService);

  // ==================== ENDPOINTS PROTEGIDOS (Requieren JWT) ====================

  /**
   * Obtener listado de jugadores con filtros y paginación
   * 🔒 REQUIERE AUTENTICACIÓN
   * ✅ CACHÉ RE-HABILITADO: Backend corregido
   */
  getPlayers(filters: PlayerFilters = {}): Observable<PaginatedResponse<FifaPlayer[]>> {
    console.log('🔵 PlayersService.getPlayers() called with filters:', filters);

    const cacheKey = `players_${JSON.stringify(filters)}`;
    const cached = this.cacheService.get<PaginatedResponse<FifaPlayer[]>>(cacheKey);
    if (cached) {
      console.log('✅ Cache HIT:', cacheKey);
      return of(cached);
    }

    ('📡 Making API request...');
    return this.apiService.getPaginated<FifaPlayer[]>('/fifa-players', filters).pipe(
      tap(response => {
        console.log('✅ API Response received:', {
          total: response.pagination?.total,
          page: response.pagination?.page,
          itemsReceived: response.data?.length
        });
        this.cacheService.set(cacheKey, response, 3 * 60 * 1000);
      })
    );
  }

  /**
   * Buscar jugadores por nombre
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  searchPlayers(query: string, limit = 10): Observable<PaginatedResponse<FifaPlayer[]>> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = this.cacheService.get<PaginatedResponse<FifaPlayer[]>>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.apiService.getPaginated<FifaPlayer[]>('/fifa-players/search', { q: query, limit }).pipe(
      tap(response => this.cacheService.set(cacheKey, response, 5 * 60 * 1000))
    );
  }

  /**
   * Obtener top jugadores por rating
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  getTopRatedPlayers(limit = 4, gender?: 'M' | 'F'): Observable<PaginatedResponse<FifaPlayer[]>> {
    const cacheKey = `top_rated_${limit}_${gender || 'all'}`;
    const cached = this.cacheService.get<PaginatedResponse<FifaPlayer[]>>(cacheKey);

    if (cached) {
      return of(cached);
    }

    const params: any = { limit };
    if (gender) params.gender = gender;

    return this.apiService.getPaginated<FifaPlayer[]>('/fifa-players/top-rated', params).pipe(
      tap(response => this.cacheService.set(cacheKey, response, 10 * 60 * 1000)) // 10 minutos
    );
  }

  /**
   * Obtener versiones FIFA disponibles
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  getFifaVersions(): Observable<ApiResponse<string[]>> {
    const cacheKey = 'fifa_versions';
    const cached = this.cacheService.get<ApiResponse<string[]>>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.apiService.get<string[]>('/fifa-players/versions').pipe(
      tap(response => this.cacheService.set(cacheKey, response, 60 * 60 * 1000)) // 1 hora
    );
  }

  /**
   * Obtener jugador por ID
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  getPlayerById(id: number, forceRefresh = false): Observable<ApiResponse<FifaPlayer>> {
    const cacheKey = `player_${id}`;

    // Si se fuerza refresh, ignorar caché
    if (!forceRefresh) {
      const cached = this.cacheService.get<ApiResponse<FifaPlayer>>(cacheKey);
      if (cached) {
        return of(cached);
      }
    } else {
    }

    return this.apiService.get<FifaPlayer>(`/fifa-players/${id}`).pipe(
      tap(response => this.cacheService.set(cacheKey, response, 5 * 60 * 1000))
    );
  }

  /**
   * Obtener estadísticas detalladas de un jugador
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  getPlayerStats(id: number): Observable<ApiResponse<FifaPlayer>> {
    const cacheKey = `player_stats_${id}`;
    const cached = this.cacheService.get<ApiResponse<FifaPlayer>>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.apiService.get<FifaPlayer>(`/fifa-players/stats/${id}`).pipe(
      tap(response => this.cacheService.set(cacheKey, response, 5 * 60 * 1000))
    );
  }

  // ==================== ENDPOINTS DE GESTIÓN (CRUD) ====================

  /**
   * Obtener estadísticas para Chart.js Radar
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  getPlayerRadarStats(id: number): Observable<ApiResponse<PlayerRadarStatsResponse>> {
    return this.apiService.get<PlayerRadarStatsResponse>(`/players/${id}/radar-stats`);
  }

  /**
   * Obtener timeline de evolución del jugador
   * 🔒 REQUIERE AUTENTICACIÓN
   * Agregado caché para evitar requests repetitivas
   */
  getPlayerTimeline(id: number, skill?: string): Observable<ApiResponse<PlayerTimeline>> {
    const cacheKey = `timeline_${id}${skill ? `_${skill}` : ''}`;
    const cached = this.cacheService.get<ApiResponse<PlayerTimeline>>(cacheKey);

    if (cached) {
      return of(cached);
    }

    const params = skill ? { skill } : {};
    return this.apiService.get<PlayerTimeline>(`/players/${id}/timeline`, params).pipe(
      tap(response => this.cacheService.set(cacheKey, response, 10 * 60 * 1000)) // 10 minutos
    );
  }

  /**
   * Crear nuevo jugador
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  createPlayer(playerData: PlayerFormData): Observable<ApiResponse<FifaPlayer>> {
    return this.apiService.post<FifaPlayer>('/players', playerData);
  }

  /**
   * Actualizar información de un jugador
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  updatePlayer(id: number, playerData: Partial<PlayerFormData>): Observable<ApiResponse<FifaPlayer>> {
    return this.apiService.put<FifaPlayer>(`/players/${id}`, playerData);
  }

  /**
   * Eliminar jugador
   * 🔒 REQUIERE AUTENTICACIÓN
   */
  deletePlayer(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<void>(`/players/${id}`);
  }

  // ==================== UTILIDADES ====================

  /**
   * Obtener color según rating para UI
   */
  getRatingColor(overall: number): string {
    if (overall >= 90) return 'gold';
    if (overall >= 80) return 'green';
    if (overall >= 70) return 'blue';
    return 'gray';
  }

  /**
   * Obtener posiciones principales del jugador como array
   */
  getPositionsArray(positions: string): string[] {
    return positions.split(',').map(p => p.trim());
  }

  /**
   * Verificar si es jugadora femenina
   */
  isFemalePlayer(player: FifaPlayer): boolean {
    return player.gender === 'F';
  }

  /**
   * Formatear valor de mercado
   */
  formatValue(value: number): string {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    else  {
      return 'Not available';
    }
    return `€${value}`;
  }

  /**
   * Invalidar caché de jugadores
   * Útil después de crear/editar/eliminar para forzar recarga desde servidor
   */
  invalidatePlayersCache(playerId?: number): void {

    this.cacheService.invalidatePattern('players_');
    this.cacheService.invalidatePattern('search_');
    this.cacheService.clearTopRatedCache();

    if (playerId) {
      this.cacheService.delete(`player_${playerId}`);
      this.cacheService.delete(`player_stats_${playerId}`);
      this.cacheService.invalidatePattern(`timeline_${playerId}`); // Limpiar también timeline
      (`🗑️ Invalidated cache for player ${playerId}`);
    }
  }

  /**
   * Actualizar caché de un jugador con nuevos datos
   * Útil cuando el PUT devuelve el jugador actualizado
   */
  updatePlayerCache(player: FifaPlayer): void {
    const cacheKey = `player_${player.id}`;
    const response: ApiResponse<FifaPlayer> = {
      success: true,
      data: player,
      timestamp: new Date().toISOString()
    };
    this.cacheService.set(cacheKey, response, 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Export players to CSV or Excel format
   * 🔒 REQUIERE AUTENTICACIÓN (JWT token)
   */
  exportPlayers(format: 'csv' | 'xlsx', filters: PlayerFilters = {}): Observable<Blob> {

    const params: any = { format };

    // Add all filters to params
    if (filters.name) params.name = filters.name;
    if (filters.position) params.position = filters.position;
    if (filters.overallMin) params.overallMin = filters.overallMin;
    if (filters.overallMax) params.overallMax = filters.overallMax;
    if (filters.fifaVersion) params.fifaVersion = filters.fifaVersion;
    if (filters.clubName) params.clubName = filters.clubName;
    if (filters.gender) params.gender = filters.gender;

    return this.apiService.getBlob('/players/export', params);
  }
}
