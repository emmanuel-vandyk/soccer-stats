import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FifaPlayer } from '../../../core/models';
import { ProxyImagePipe } from '../../pipes/proxy-image.pipe';
import { PrefetchPlayerDirective } from '../../directives';

@Component({
  selector: 'app-player-card',
  imports: [ProxyImagePipe, PrefetchPlayerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="player-card"
      [class.compact]="compact()"
      [prefetchPlayer]="player().id"
    >
      <!-- Action buttons -->
      <div class="card-actions">
        <button class="action-btn edit-btn" (click)="onEdit($event)" title="Edit player">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="action-btn delete-btn" (click)="onDelete($event)" title="Delete player">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Card background image -->
      <div class="card-background" (click)="navigateToPlayer()"></div>

      <!-- Overall rating top left -->
      <div class="overall-rating" (click)="navigateToPlayer()">
        <div class="overall-number">{{ player().overall }}</div>
        <div class="overall-position">{{ getMainPosition() }}</div>
      </div>

      <!-- Player image -->
      <div class="player-image-container" (click)="navigateToPlayer()">
        <img
          [src]="player().player_face_url | proxyImage"
          [alt]="getDisplayName()"
          class="player-face"
          style="view-transition-name: player-image"
          loading="lazy"
          (error)="onImageError($event)"
        />
      </div>

      <!-- Player name in gold section -->
      <div class="player-name" (click)="navigateToPlayer()">{{ getDisplayName() }}</div>

      @if (!compact()) {
        <!-- Stats section -->
        <div class="stats-section" (click)="navigateToPlayer()">
          <div class="stats-row">
            <div class="stat-group">
              <span class="stat-label">PAC</span>
              <span class="stat-value">{{ player().pace || 0 }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">SHO</span>
              <span class="stat-value">{{ player().shooting || 0 }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">PAS</span>
              <span class="stat-value">{{ player().passing || 0 }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">DRI</span>
              <span class="stat-value">{{ player().dribbling || 0 }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">DEF</span>
              <span class="stat-value">{{ player().defending || 0 }}</span>
            </div>
            <div class="stat-group">
              <span class="stat-label">PHY</span>
              <span class="stat-value">{{ player().physic || 0 }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .player-card {
      position: relative;
      width: 280px;
      height: 380px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: transparent;

      &:hover {
        transform: translateY(-8px) scale(1.05);
        filter: drop-shadow(0 10px 30px rgba(218, 165, 32, 0.4));

        .card-actions {
          opacity: 1;
        }
      }

      &.compact .stats-section { display: none; }
    }

    .card-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 8px;
      z-index: 20;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(8px);

      svg {
        width: 18px;
        height: 18px;
      }

      &.edit-btn {
        background: rgba(59, 130, 246, 0.9);
        color: white;

        &:hover {
          background: rgba(37, 99, 235, 1);
          transform: scale(1.1);
        }
      }

      &.delete-btn {
        background: rgba(239, 68, 68, 0.9);
        color: white;

        &:hover {
          background: rgba(220, 38, 38, 1);
          transform: scale(1.1);
        }
      }
    }

    .card-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('/images/fc-shield-soccer-gold.png');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 0;
      cursor: pointer;
    }

    .overall-rating {
      position: absolute;
      top: 3rem;
      left: 2.5rem;
      z-index: 10;
      text-align: center;
      color: #8B4513;
    }

    .overall-number {
      font-size: 36px;
      font-weight: 900;
      line-height: 0.9;
      margin-bottom: 2px;
    }

    .overall-position {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .player-image-container {
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      border: none;
    }

    .player-face {
      width: auto;
      height: 215px;
      object-fit: contain;
      object-position: center;

    }

    .player-name {
      position: absolute;
      top: 256px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      font-size: 20px;
      font-weight: 800;
      color: #8B4513;
      text-align: center;
      width: 240px;
      line-height: 1.1;
    }

    .stats-section {
      position: absolute;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      width: 240px;
      z-index: 5;
    }

    .stats-row {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      padding: 0 2rem;
    }

    .stat-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .stat-label {
      font-size: 16px;
      font-weight: 600;
      color: #8B4513;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 800;
      color: #8B4513;
    }

    .avatar-player {
      width: 205px;
      height: 245px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .player-card {
        width: 240px;
        height: 320px;
        margin: 0 auto;
      }

      .overall-rating {
        top: 2.5rem;
        left: 2.2rem;
      }

      .overall-number {
        font-size: 28px;
      }

      .overall-position {
        font-size: 11px;
      }

      .player-image-container {
        top: 55px;
      }

      .player-face {
        height: 190px;
        width: auto;
      }

      .avatar-player {
        width: 205px;
        height: 210px;
      }


      .player-name {
        top: 215px;
        font-size: 20px;
        width: 210px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 8px;
      }

      .stats-section {
        bottom: 2.2rem;
        width: 210px;
      }

      .stats-row {
        padding: 0 1.2rem;
      }

      .stat-label {
        font-size: 14px;
      }

      .stat-value {
        font-size: 14px;
      }

      .card-actions {
        opacity: 1; /* Siempre visible en mobile */
      }
    }

    @media (max-width: 480px) {
      .player-card {
        width: 220px;
        height: 300px;
      }

      .overall-rating {
        top: 2rem;
        left: 1.6rem;
      }

      .overall-number {
        padding: .3rem;
        font-size: 26px;
      }

      .overall-position {
        font-size: 12px;
      }

      .player-image-container {
        top: 50px;
      }

      .player-face {
        height: 180px;
      }

      .avatar-player {
        width: 205px;
        height: 205px;
      }

      .player-name {
        top: 200px;
        font-size: 18px;
        width: 190px;
      }

      .stats-section {
        bottom: 2rem;
        width: 190px;
      }

      .stats-row {
        padding: 0 1rem;
      }

      .stat-label {
        font-size: 14px;
      }

      .stat-value {
        font-size: 14px;
      }

      .action-btn {
        width: 28px;
        height: 28px;

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  `]
})
export class PlayerCardComponent {
  private readonly router = inject(Router);

  player = input.required<FifaPlayer>();
  compact = input(false);

  cardClick = output<FifaPlayer>();
  edit = output<FifaPlayer>();
  delete = output<FifaPlayer>();

  navigateToPlayer(): void {
    const playerId = this.player().id;


    // Use View Transition API if supported
    if ('startViewTransition' in document && (document as any).startViewTransition) {
      ('✨ Using View Transition API');
      (document as any).startViewTransition(() => {
        this.router.navigate(['/players', playerId]);
      });
    } else {
      ('⚠️ View Transition API not supported, using regular navigation');
      this.router.navigate(['/players', playerId]);
    }
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.player());
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.player());
  }

  getOverallClass(overall: number): string {
    if (overall >= 85) return 'overall-excellent';
    if (overall >= 75) return 'overall-good';
    if (overall >= 65) return 'overall-average';
    return 'overall-low';
  }

  getPositions(): string[] {
    return this.player().player_positions.split(',').map(p => p.trim()).slice(0, 3);
  }

  getMainPosition(): string {
    return this.player().player_positions.split(',')[0].trim();
  }

  getDisplayName(): string {
    const player = this.player();
    if (player.short_name) {
      return player.short_name;
    }
    // Si no hay short_name, generar uno a partir del long_name
    const names = player.long_name.split(' ');
    if (names.length <= 2) {
      return player.long_name;
    }
    // Tomar primer nombre y primer apellido
    return `${names[0]} ${names[names.length - 1]}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/images/avatar-fifa-player.png';
    img.classList.add('avatar-player');
  }
}
