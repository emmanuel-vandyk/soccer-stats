import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PlayersService } from '../services';
import { ApiResponse, FifaPlayer } from '../models';
import { catchError, of } from 'rxjs';

/**
 * Resolve for loading a player before displaying the page
 * If it fails, returns null to allow the page to load anyway
 */
export const playerDetailResolver: ResolveFn<ApiResponse<FifaPlayer> | null> = (route, state) => {
  const playersService = inject(PlayersService);
  const id = parseInt(route.paramMap.get('id') || '0', 10);

  if (!id) {
    console.warn('Invalid player ID in resolver');
    return of(null);
  }

  return playersService.getPlayerById(id).pipe(
    catchError((error) => {
      console.warn('Player detail resolver failed, page will load without preloaded data:', error);
      return of(null);
    })
  );
};
