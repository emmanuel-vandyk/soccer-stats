import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PlayersService } from '../services';
import { PaginatedResponse } from '../models';
import { FifaPlayer } from '../models';
import { catchError, of } from 'rxjs';

/**
 * Resolve for loading a list of players before displaying the page
 * If it fails, returns null to allow the page to load anyway
 */
export const playerListResolver: ResolveFn<PaginatedResponse<FifaPlayer[]> | null> = (route, state) => {
  const playersService = inject(PlayersService);

  // Extraer parámetros de la query
  const gender = route.queryParamMap.get('gender') as 'M' | 'F' | undefined;
  const page = parseInt(route.queryParamMap.get('page') || '1', 10);

  // Precargar datos con filtros básicos
  return playersService.getPlayers({
    gender: gender || 'M',
    page,
    limit: 20
  }).pipe(
    catchError((error) => {
      console.warn('Player list resolver failed, page will load without preloaded data:', error);
      return of(null);
    })
  );
};
