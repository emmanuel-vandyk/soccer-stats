import { Directive, Input, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlayersService } from '../../core/services';

/**
 * Directiva para precargar datos de un jugador al hacer hover
 * Mejora la experiencia del usuario precargando antes del click
 *
 * Uso: <a [routerLink]="['/players', player.id]" [prefetchPlayer]="player.id">
 */
@Directive({
  selector: '[prefetchPlayer]'
})
export class PrefetchPlayerDirective {
  private readonly playersService = inject(PlayersService);
  private prefetched = false;

  @Input() prefetchPlayer!: number;

  @HostListener('mouseenter')
  @HostListener('touchstart')
  onHover(): void {
    if (!this.prefetched && this.prefetchPlayer) {
      (`Prefetching player ${this.prefetchPlayer}`);
      this.playersService.getPlayerById(this.prefetchPlayer).subscribe({
        next: () => {
          (`Player ${this.prefetchPlayer} prefetched successfully`);
          this.prefetched = true;
        },
        error: (err) => {
          console.error(`Error prefetching player ${this.prefetchPlayer}:`, err);
        }
      });
    }
  }
}
