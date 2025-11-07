import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PlayersService } from '../services';
import { PaginatedResponse, FifaPlayer } from '../models';
import { catchError, of } from 'rxjs';

/**
 * Resolver para precargar jugadores destacados en la página de inicio
 * Si falla, retorna null para permitir que la página se cargue de todos modos
 */
export const homeResolver: ResolveFn<PaginatedResponse<FifaPlayer[]> | null> = (route, state) => {
  const playersService = inject(PlayersService);

  return playersService.getTopRatedPlayers(4).pipe(
    catchError((error) => {
      console.warn('Home resolver failed, page will load without preloaded data:', error);
      return of(null);
    })
  );
};
