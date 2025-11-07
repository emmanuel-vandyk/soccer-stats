import { Component, OnInit, signal, inject } from '@angular/core';
import { PlayersService } from '../../../core/services';
import { FifaPlayer } from '../../../core/models';
import { PlayerCardComponent } from '../../../shared/components/player-card/player-card.component';

@Component({
  selector: 'app-top-rated',
  imports: [PlayerCardComponent],
  template: `
    <div class="top-rated-page">
      <!-- Header Section -->
      <section class="page-header">
        <div class="header-content">
          <h1>Top Rated Players</h1>
          <p>Discover the highest rated players in FIFA</p>
        </div>
      </section>

      <!-- Gender Filter -->
      <section class="filters">
        <div class="filter-buttons">
          <button
            class="filter-btn"
            [class.active]="selectedGender() === null"
            (click)="filterByGender(null)"
          >
            All Players
          </button>
          <button
            class="filter-btn"
            [class.active]="selectedGender() === 'M'"
            (click)="filterByGender('M')"
          >
            ⚽ Men's Soccer
          </button>
          <button
            class="filter-btn"
            [class.active]="selectedGender() === 'F'"
            (click)="filterByGender('F')"
          >
            ⚽ Women's Soccer
          </button>
        </div>
      </section>

      <!-- Top Rated Players Grid -->
      <section class="players-section">
        @if (loading()) {
          <div class="loading">Loading top rated players...</div>
        } @else if (error()) {
          <div class="error">
            <p>{{ error() }}</p>
            <button class="retry-btn" (click)="loadPlayers()">Retry</button>
          </div>
        } @else if (players().length > 0) {
          <div class="players-grid">
            @for (player of players(); track player.id) {
              <app-player-card [player]="player" />
            }
          </div>
        } @else {
          <div class="empty">
            <p>No top rated players found</p>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .top-rated-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding-bottom: 4rem;
    }

    .page-header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 4rem 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-content h1 {
      font-size: 3.5rem;
      font-weight: 900;
      color: white;
      margin: 0 0 1rem 0;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .header-content p {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }

    .filters {
      padding: 2rem;
      display: flex;
      justify-content: center;
    }

    .filter-buttons {
      display: flex;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 0.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .filter-btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
    }

    .filter-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .filter-btn.active {
      background: white;
      color: #667eea;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .players-section {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .loading, .error, .empty {
      text-align: center;
      padding: 4rem 2rem;
      color: white;
      font-size: 1.2rem;
    }

    .error {
      background: rgba(239, 68, 68, 0.1);
      border-radius: 12px;
      padding: 2rem;
    }

    .retry-btn {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .header-content h1 {
        font-size: 2.5rem;
      }

      .filter-buttons {
        flex-direction: column;
        width: 100%;
      }

      .players-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }
    }
  `]
})
export class TopRatedComponent implements OnInit {
  private readonly playersService = inject(PlayersService);

  players = signal<FifaPlayer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedGender = signal<'M' | 'F' | null>(null);

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.playersService.getTopRatedPlayers(12, this.selectedGender() || undefined).subscribe({
      next: (response) => {
        this.players.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load top rated players. Please try again.');
        this.loading.set(false);
        console.error('Error loading top rated players:', err);
      }
    });
  }

  filterByGender(gender: 'M' | 'F' | null): void {
    this.selectedGender.set(gender);
    this.loadPlayers();
  }
}
