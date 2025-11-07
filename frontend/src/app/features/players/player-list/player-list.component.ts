import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, switchMap, debounceTime } from 'rxjs';
import { PlayersService, ToastService, PlayerFiltersService } from '../../../core/services';
import { FifaPlayer, PlayerFilters } from '../../../core/models';
import { PlayerCardComponent } from '../../../shared/components/player-card/player-card.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { PlayerSkeletonComponent } from '../../../shared/components/player-skeleton/player-skeleton.component';
import { TableSkeletonComponent } from '../../../shared/components/table-skeleton/table-skeleton.component';
import { PlayerFormModalComponent } from '../../../shared/components/player-form-modal/player-form-modal.component';
import { ProxyImagePipe } from '../../../shared/pipes/proxy-image.pipe';

@Component({
  selector: 'app-player-list',
  imports: [PlayerCardComponent, SearchBarComponent, PlayerSkeletonComponent, TableSkeletonComponent, PlayerFormModalComponent, FormsModule, RouterLink, ProxyImagePipe],
  template: `
    <div class="players-page">
      <div class="page-header">
        <div class="header-content">
          <h1>FIFA {{ selectedFifaVersion || 'Version' }}</h1>
          @if (totalPlayers() > 0) {
            <p>
              {{ totalPlayers().toLocaleString() }} players found
              @if (selectedFifaVersion) {
                <span class="filter-info">FIFA {{ selectedFifaVersion }}</span>
              }
              @if (selectedPosition) {
                <span class="filter-info">{{ selectedPosition }}</span>
              }
              @if (selectedOverallRange) {
                <span class="filter-info">Rating {{ selectedOverallRange }}</span>
              }
              <span class="filter-info gender-mixed">⚽ Male and Female</span>
            </p>
          }
        </div>
      </div>

      <div class="page-content">
        <!-- Barra de búsqueda -->
        <div class="search-section">
          <app-search-bar (search)="onSearch($event)" />
        </div>

        <!-- Filtros avanzados -->
        <div class="filters-section">
          <div class="filters-left">
            <div class="filter-group">
              <label>Filter by:</label>
              <button class="filter-chip" [class.active]="currentGender() === 'M'" (click)="filterByGender('M')">
                ⚽ Male
              </button>
              <button class="filter-chip" [class.active]="currentGender() === 'F'" (click)="filterByGender('F')">
                ⚽ Female
              </button>
              <button class="filter-chip" [class.active]="currentGender() === undefined && !showTopRated()" (click)="clearGenderFilter()">
                🌐 Both
              </button>
              <button class="filter-chip top-rated" [class.active]="showTopRated()" (click)="toggleTopRated()">
                ⭐ Top Rated
              </button>
            </div>

            <div class="filter-dropdowns">
            <select class="filter-select" [(ngModel)]="selectedPosition" (change)="applyFilters()">
              <option value="">Position</option>
              <option value="GK">Goalkeeper (GK)</option>
              <option value="CB">Center Back (CB)</option>
              <option value="LB">Left Back (LB)</option>
              <option value="RB">Right Back (RB)</option>
              <option value="CDM">Defensive Midfielder (CDM)</option>
              <option value="CM">Central Midfielder (CM)</option>
              <option value="CAM">Attacking Midfielder (CAM)</option>
              <option value="LM">Left Midfielder (LM)</option>
              <option value="RM">Right Midfielder (RM)</option>
              <option value="LW">Left Winger (LW)</option>
              <option value="RW">Right Winger (RW)</option>
              <option value="ST">Striker (ST)</option>
              <option value="CF">Center Forward (CF)</option>
            </select>

            <select class="filter-select" [(ngModel)]="selectedFifaVersion" (change)="onFifaVersionChange()">
              <option value="">FIFA Version</option>
              <option value="23">FIFA 23</option>
              <option value="22">FIFA 22</option>
              <option value="21">FIFA 21</option>
              <option value="20">FIFA 20</option>
              <option value="19">FIFA 19</option>
              <option value="18">FIFA 18</option>
              <option value="17">FIFA 17</option>
              <option value="16">FIFA 16</option>
              <option value="15">FIFA 15</option>
            </select>

            <select class="filter-select" [(ngModel)]="selectedClub" (change)="applyFilters()">
              <option value="">Team</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Real Madrid CF">Real Madrid</option>
              <option value="Manchester City">Manchester City</option>
              <option value="Liverpool">Liverpool</option>
              <option value="FC Bayern München">FC Bayern München</option>
              <option value="Paris Saint Germain">Paris Saint Germain</option>
              <option value="Lyon">Olympique Lyonnais</option>
              <option value="Olympique de Marseille">Olympique de Marseille</option>
              <option value="AS Monaco">AS Monaco</option>
              <option value="OGC Nice">OGC Nice</option>
              <option value="Montpellier HSC">Montpellier HSC</option>
              <option value="Juventus">Juventus</option>
              <option value="Chelsea">Chelsea</option>
              <option value="Manchester United">Manchester United</option>
              <option value="Arsenal">Arsenal</option>
              <option value="West Ham">West Ham</option>
              <option value="Newcastle United">Newcastle United</option>
              <option value="Aston Villa">Aston Villa</option>
              <option value="Wolverhampton Wanderers">Wolverhampton Wanderers</option>
              <option value="Fulham">Fulham</option>
              <option value="Brentford">Brentford</option>
              <option value="Atlético Madrid">Atlético Madrid</option>
              <option value="Borussia Dortmund">Borussia Dortmund</option>
              <option value="Inter">Inter</option>
              <option value="Milan">Milan</option>
              <option value="Tottenham Hotspur">Tottenham Hotspur</option>
              <option value="RB Leipzig">RB Leipzig</option>
              <option value="Galatasaray SK">Galatasaray SK</option>
              <option value="Fenerbahçe SK">Fenerbahçe SK</option>
              <option value="Beşiktaş JK">Beşiktaş JK</option>
              <option value="PSV">PSV</option>
              <option value="Ajax">Ajax</option>
              <option value="Feyenoord">Feyenoord</option>
              <option value="Sevilla FC">Sevilla FC</option>
              <option value="Real Betis">Real Betis</option>
              <option value="Real Sociedad">Real Sociedad</option>
              <option value="Granada CF">Granada CF</option>
              <option value="Roma">Roma</option>
              <option value="Napoli">Napoli</option>
              <option value="Ajax">Ajax</option>
              <option value="Benfica">Benfica</option>
              <option value="Porto">Porto</option>
              <option value="Bayer 04 Leverkusen">Bayer 04 Leverkusen</option>
              <option value="Valencia CF">Valencia CF</option>
              <option value="Villarreal CF">Villarreal CF</option>
              <option value="River Plate">River Plate</option>
              <option value="Boca Juniors">Boca Juniors</option>
              <option value="Independiente">Independiente</option>
              <option value="Racing Club">Racing Club</option>
              <option value="Talleres Córdoba">Talleres Córdoba</option>
              <option value="San Lorenzo">San Lorenzo</option>
              <option value="Huracán">Huracán</option>
              <option value="Banfield">Banfield</option>
              <option value="Lanús">Lanús</option>
              <option value="Rosario Central">Rosario Central</option>
              <option value="Estudiantes de La Plata">Estudiantes de La Plata</option>
              <option value="Gimnasia y Esgrima La Plata">Gimnasia y Esgrima La Plata</option>
              <option value="Velez Sarsfield">Velez Sarsfield</option>
              <option value="Tigre">Tigre</option>
              <option value="Sarmiento">Sarmiento</option>
              <option value="Argentinos Juniors">Argentinos Juniors</option>
              <option value="Belgrano de Córdoba">Belgrano de Córdoba</option>
            </select>

            <select class="filter-select" [(ngModel)]="selectedOverallRange" (change)="applyFilters()">
              <option value="">Overall Rating</option>
              <option value="90-99">90 - 99 (Elite)</option>
              <option value="80-89">80 - 89 (Excellent)</option>
              <option value="70-79">70 - 79 (Good)</option>
              <option value="60-69">60 - 69 (Average)</option>
              <option value="0-59">Less than 60</option>
            </select>

            <button class="btn-clear-filters" (click)="clearAllFilters()" title="Clear all filters">
              Clear Filters
            </button>
          </div>
          </div>

          <button class="btn-create-player" (click)="openCreateModal()">
            Create Player
          </button>

          <div class="filters-right">
          <!-- View mode toggle -->
              <div class="view-toggle">
              <button
                class="toggle-btn"
                [class.active]="viewMode() === 'cards'"
                (click)="setViewMode('cards')"
                title="Vista en tarjetas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                class="toggle-btn"
                [class.active]="viewMode() === 'table'"
                (click)="setViewMode('table')"
                title="Vista en tabla"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            <!-- Export dropdown -->
            <div class="export-dropdown">
              <button
                class="btn-dropdown-toggle"
                (click)="toggleExportDropdown()"
                [disabled]="isExporting()"
                title="Export options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              @if (showExportDropdown()) {
                <div class="dropdown-menu">
                  <button
                    class="dropdown-item"
                    (click)="exportPlayers('csv')"
                    [disabled]="isExporting()"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    class="dropdown-item"
                    (click)="exportPlayers('xlsx')"
                    [disabled]="isExporting()"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Excel
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Grid players -->
        @if (loading()) {
          @if (viewMode() === 'cards') {
            <div class="players-grid">
              @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
                <app-player-skeleton />
              }
            </div>
          } @else {
            <div class="table-view">
              <app-table-skeleton [rows]="10" [columns]="8" />
            </div>
          }
        } @else if (error()) {
          <div class="error">
            <p>{{ error() }}</p>
            <button (click)="loadPlayers()">Try Again</button>
          </div>
        } @else if (players().length === 0) {
          <div class="empty">
            <p>No players found</p>
          </div>
        } @else {
          <!-- Cards View -->
          @if (viewMode() === 'cards') {
            <div class="players-grid">
              @for (player of players(); track player.id) {
                <app-player-card
                  [player]="player"
                  (edit)="openEditModal($event)"
                  (delete)="confirmDelete($event)"
                />
              }
            </div>
          }

          <!-- Table View -->
          @if (viewMode() === 'table') {
            <div class="players-table-container">
              <table class="players-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Club</th>
                    <th>Nationality</th>
                    <th>Position</th>
                    <th class="text-center">OVR</th>
                    <th class="text-center">POT</th>
                    <th class="text-center">Age</th>
                    <th class="text-center">PAC</th>
                    <th class="text-center">SHO</th>
                    <th class="text-center">PAS</th>
                    <th class="text-center">DRI</th>
                    <th class="text-center">DEF</th>
                    <th class="text-center">PHY</th>
                  </tr>
                </thead>
                <tbody>
                  @for (player of players(); track player.id) {
                    <tr class="table-row" [routerLink]="['/players', player.id]">
                      <td>
                        <div class="player-name-cell">
                          <img
                            [src]="player.player_face_url | proxyImage"
                            [alt]="generateShortName(player.short_name || player.long_name)"
                            class="player-thumb"
                            loading="lazy"
                            (error)="onImageError($event)"
                          />
                          <span>{{ generateShortName(player.short_name || player.long_name) }}</span>
                        </div>
                      </td>
                      <td>{{ player.club_name || '-' }}</td>
                      <td>{{ player.nationality_name }}</td>
                      <td><span class="position-badge">{{ getMainPosition(player.player_positions) }}</span></td>
                      <td class="text-center"><strong>{{ player.overall }}</strong></td>
                      <td class="text-center">{{ player.potential }}</td>
                      <td class="text-center">{{ player.age }}</td>
                      <td class="text-center stat-value">{{ player.pace || '-' }}</td>
                      <td class="text-center stat-value">{{ player.shooting || '-' }}</td>
                      <td class="text-center stat-value">{{ player.passing || '-' }}</td>
                      <td class="text-center stat-value">{{ player.dribbling || '-' }}</td>
                      <td class="text-center stat-value">{{ player.defending || '-' }}</td>
                      <td class="text-center stat-value">{{ player.physic || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button
                class="page-btn"
                [disabled]="currentPage() === 1"
                (click)="goToPage(currentPage() - 1)"
              >
                ←
              </button>

              @for (page of getPageNumbers(); track page) {
                @if (page === '...') {
                  <span class="page-ellipsis">...</span>
                } @else {
                  <button
                    class="page-btn"
                    [class.active]="page === currentPage()"
                    (click)="typeof page === 'number' && goToPage(page)"
                  >
                    {{ page }}
                  </button>
                }
              }

              <button
                class="page-btn"
                [disabled]="currentPage() === totalPages()"
                (click)="goToPage(currentPage() + 1)"
              >
                →
              </button>
            </div>
          }
        }
      </div>
    </div>

    <!-- Player modal -->
    @if (showPlayerModal()) {
      <app-player-form-modal
        [player]="selectedPlayer()"
        (close)="closePlayerModal()"
        (saved)="onPlayerSaved($event)"
      />
    }
  `,
  styles: [`
    .players-page {
      min-height: 100vh;
      background: #f9fafb;
    }

    .page-header {
      background: white;
      padding: 32px 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .header-content {
        max-width: 1400px;
        margin: 0 auto;

        h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        p {
          color: #6b7280;
          margin: 0;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .filter-info {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
          }
        }

        .info-note {
          margin-top: 8px !important;
          padding: 8px 12px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 8px;
          font-size: 13px;
          width: fit-content;
        }
      }
    }

    .page-content {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      overflow-x: hidden; /* Prevenir overflow horizontal */
      width: 100%;
    }

    .search-section {
      margin-bottom: 24px;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 32px;
      align-items: flex-start;
      flex-wrap: wrap;
      width: 100%;
      justify-content: space-between;
    }

    .filters-left {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }

    .filters-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      label {
        font-weight: 600;
        color: #374151;
        font-size: 14px;
      }
    }

    .filter-chip {
      padding: 8px 20px;
      border: 2px solid #e5e7eb;
      border-radius: 20px;
      background: white;
      color: #6b7280;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #3b82f6;
        color: #3b82f6;
      }

      &.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      &.top-rated {
        border-color: #fbbf24;

        &:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        &.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: #f59e0b;
          color: white;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }
      }
    }

    .btn-clear-filters {
      padding: 10px 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
      white-space: nowrap;
      min-width: 120px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .btn-create-player {
      margin-left: auto;
      padding: 10px 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      white-space: nowrap;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .filter-dropdowns {
      display: flex;
      gap: 8px;
      flex: 1;
      flex-wrap: wrap;
      padding: 0 16px;
    }

    .filter-select {
      padding: 10px 16px;
      padding-right: 36px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.2s;
      min-width: 150px;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
      background-position: right 12px center;
      background-repeat: no-repeat;
      background-size: 24px;

      &:hover:not(.disabled) {
        border-color: #3b82f6;
      }

      &:focus {
        outline: none;
        border-color: #3b82f6;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #f9fafb;
      }

    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
      justify-items: center; /* Centrar las cards en el grid */
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 24px 0;
    }

    .page-btn {
      min-width: 40px;
      height: 40px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: #3b82f6;
        color: #3b82f6;
      }

      &.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .page-ellipsis {
      color: #9ca3af;
      font-weight: 500;
    }

    .loading, .error, .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;

      p {
        color: #6b7280;
        font-size: 18px;
        margin: 0;
      }

      button {
        margin-top: 16px;
        padding: 10px 24px;
        border: none;
        border-radius: 8px;
        background: #3b82f6;
        color: white;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          background: #2563eb;
        }
      }
    }

    /* View mode toggle */
    .view-toggle {
      display: flex;
      gap: 8px;
      background: #f3f4f6;
      padding: 4px;
      border-radius: 8px;
    }

    .toggle-btn {
      padding: 8px 16px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: #e5e7eb;
        color: #374151;
      }

      &.active {
        background: white;
        color: #3b82f6;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
    }

    .export-dropdown {
      position: relative;
      display: flex;
      align-items: center;
      margin-left: 12px;
    }

    .btn-dropdown-toggle {
      width: 40px;
      height: 40px;
      border: none;
      background: #f3f4f6;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      transition: all 0.2s ease;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover:not(:disabled) {
        background: #e5e7eb;
        color: #374151;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      min-width: 180px;
      padding: 6px;
      z-index: 100;
      animation: dropdownSlide 0.2s ease;
    }

    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      width: 100%;
      padding: 10px 14px;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;

      svg {
        width: 18px;
        height: 18px;
        color: #6b7280;
      }

      &:hover:not(:disabled) {
        background: #f3f4f6;
        color: #3b82f6;

        svg {
          color: #3b82f6;
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* Vista de tabla */
    .players-table-container {
      overflow-x: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .players-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;

      thead {
        background: #f9fafb;
        border-bottom: 2px solid #e5e7eb;

        th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;

          &.text-center {
            text-align: center;
          }
        }
      }

      tbody {
        tr.table-row {
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background-color 0.15s ease;

          &:hover {
            background-color: #f9fafb;
          }

          &:last-child {
            border-bottom: none;
          }
        }

        td {
          padding: 12px 16px;
          color: #6b7280;
          white-space: nowrap;

          &.text-center {
            text-align: center;
          }

          strong {
            color: #1f2937;
            font-weight: 600;
          }
        }

        .player-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 200px;
          color: #1f2937;
          font-weight: 500;

          .player-thumb {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            object-fit: cover;
            background: #f3f4f6;
          }
        }

        .position-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-value {
          color: #059669;
          font-weight: 500;
        }
      }
    }

    /* Tablet styles */
    @media (max-width: 1024px) {
      .page-header {
        padding: 24px 16px;

        .header-content h1 {
          font-size: 28px;
        }
      }

      .page-content {
        padding: 16px;
      }

      .players-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      .filter-dropdowns {
        gap: 8px;
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .page-header {
        padding: 16px;

        .header-content {
          h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }

          p {
            font-size: 14px;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .info-note {
            font-size: 12px;
            width: 100%;
            box-sizing: border-box;
          }
        }
      }

      .page-content {
        padding: 12px 8px;
        max-width: 100vw;
      }

      .search-section {
        margin-bottom: 16px;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        margin-bottom: 20px;
      }

      .filters-left {
        width: 100%;
      }

      .filter-group {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;

        label {
          font-size: 13px;
        }

        .filter-chip {
          width: 100%;
          justify-content: center;
          padding: 10px 16px;
          font-size: 14px;
        }
      }

      .filter-dropdowns {
        flex-direction: column;
        padding: 0;
        gap: 8px;
      }

      .filter-select {
        width: 100%;
        min-width: auto;
        font-size: 14px;
      }

      .btn-clear-filters {
        width: 100%;
        margin-top: 8px;
      }

      .btn-create-player {
        width: 100%;
        margin-left: 0;
        padding: 12px 24px;
        font-size: 15px;
      }

      .view-toggle {
        width: auto;
        margin-left: 0;
        margin-top: 12px;

        .toggle-btn {
          padding: 10px 14px;
        }
      }

      .export-dropdown {
        margin-left: 8px;
        margin-top: 12px;
      }

      .players-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        justify-items: center; /* Centrar las cards */
        padding: 0 8px;
      }

      .players-table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .players-table {
        font-size: 11px;
        min-width: 700px;

        thead th,
        tbody td {
          padding: 6px 8px;
        }

        .player-name-cell {
          min-width: 120px;

          .player-thumb {
            width: 28px;
            height: 28px;
          }

          span {
            font-size: 12px;
          }
        }

        .position-badge {
          font-size: 10px;
          padding: 3px 6px;
        }
      }

      .pagination {
        flex-wrap: wrap;
        gap: 6px;

        .page-btn {
          min-width: 36px;
          height: 36px;
          font-size: 13px;
        }
      }

      .loading-skeleton {
        padding: 16px 12px;

        h2 {
          font-size: 18px;
        }
      }

      .empty-state {
        padding: 32px 16px;

        h3 {
          font-size: 18px;
        }

        p {
          font-size: 14px;
        }
      }

      .error-state {
        padding: 32px 16px;

        h3 {
          font-size: 18px;
        }

        p {
          font-size: 14px;
        }
      }
    }

    /* Small mobile styles */
    @media (max-width: 480px) {
      .page-header {
        padding: 12px;

        .header-content h1 {
          font-size: 20px;
        }
      }


      .players-grid {
        gap: 10px;
      }

      .filters-right {
        width: 100%;
        align-items: center;
        justify-content: space-between;
        padding: 0 .1rem;
      }

      .pagination {
        .page-btn {
          min-width: 32px;
          height: 32px;
          font-size: 12px;
          padding: 0 8px;
        }

        .page-ellipsis {
          padding: 0 4px;
        }
      }
    }
  `]
})
export class PlayerListComponent implements OnInit, OnDestroy {
  private readonly playersService = inject(PlayersService);
  private readonly toastService = inject(ToastService);
  private readonly filtersService = inject(PlayerFiltersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  players = signal<FifaPlayer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal for create/edit player
  showPlayerModal = signal(false);
  selectedPlayer = signal<FifaPlayer | null>(null);

  // Export state
  isExporting = signal(false);
  showExportDropdown = signal(false);

  // Get filters from global state
  private get filterState() {
    return this.filtersService.filters();
  }

  // Reactive signals for template binding
  currentGender = computed(() => this.filtersService.filters().currentGender);
  searchQuery = computed(() => this.filtersService.filters().searchQuery);
  showTopRated = computed(() => this.filtersService.filters().showTopRated);
  viewMode = computed(() => this.filtersService.filters().viewMode);
  currentPage = computed(() => this.filtersService.filters().currentPage);

  get selectedPosition() {
    return this.filterState.selectedPosition;
  }

  set selectedPosition(value: string) {
    this.filtersService.updateFilter('selectedPosition', value);
  }

  get selectedOverallRange() {
    return this.filterState.selectedOverallRange;
  }

  set selectedOverallRange(value: string) {
    this.filtersService.updateFilter('selectedOverallRange', value);
  }

  get selectedFifaVersion() {
    return this.filterState.selectedFifaVersion;
  }

  set selectedFifaVersion(value: string) {
    this.filtersService.updateFilter('selectedFifaVersion', value);
  }

  get selectedClub() {
    return this.filterState.selectedClub;
  }

  set selectedClub(value: string) {
    this.filtersService.updateFilter('selectedClub', value);
  }

  // Pagination
  totalPages = signal(1);
  totalPlayers = signal(0);
  itemsPerPage = 20;

  ngOnInit(): void {

    this.loadPlayers();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['gender']) {
          this.filtersService.updateFilter('currentGender', params['gender']);
        }
        if (params['fifaVersion']) {
          this.filtersService.updateFilter('selectedFifaVersion', params['fifaVersion']);
        }
        this.loadPlayers();
      });
  }



  ngOnDestroy(): void {
    ('🛑 PlayerListComponent destroyed - canceling pending requests');
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPlayers(): void {
    this.loading.set(true);
    this.error.set(null);

    const state = this.filterState;

    if (state.showTopRated) {
      ('⭐ Loading top-rated players');
      this.playersService.getTopRatedPlayers(this.itemsPerPage, state.currentGender)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.players.set(response.data || []);

            if (response.pagination) {
              this.totalPlayers.set(response.pagination.total);
              this.totalPages.set(1);
            } else {
              this.totalPlayers.set(response.data?.length || 0);
              this.totalPages.set(1);
            }

            this.loading.set(false);
          },
          error: (err) => {
            console.error('❌ Error loading top-rated players:', err);
            this.error.set(err.message || 'Error al cargar jugadores top. Necesitas iniciar sesión.');
            this.loading.set(false);
          }
        });
      return;
    }

    const filters: PlayerFilters = {
      limit: this.itemsPerPage,
      page: state.currentPage
    };

    if (state.currentGender) {
      filters.gender = state.currentGender;
    }

    if (state.searchQuery) {
      filters.name = state.searchQuery;
    }

    if (state.selectedPosition) {
      filters.position = state.selectedPosition;
    }

    if (state.selectedOverallRange) {
      const [min, max] = state.selectedOverallRange.split('-').map(Number);
      filters.overallMin = min;
      filters.overallMax = max;
    }

    if (state.selectedFifaVersion) {
      filters.fifaVersion = state.selectedFifaVersion;
    }

    if (state.selectedClub) {
      filters.clubName = state.selectedClub;
    }


    this.playersService.getPlayers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {

          let players = response.data || [];
          if (Array.isArray(players) && players.length > 0) {
            const originalCount = players.length;

            const seen = new Set();
            players = players.filter((player: any) => {
              if (!player) return false;

              const uniqueKey = player.id || `${player.short_name || player.name}_${player.overall}_${player.fifa_version}`;

              if (seen.has(uniqueKey)) {
                return false;
              }

              seen.add(uniqueKey);
              return true;
            });

            if (originalCount !== players.length) {
              (`🧹 Removed ${originalCount - players.length} duplicates: ${originalCount} → ${players.length} players`);
            }
          }

          this.players.set(players);

          if (response.pagination) {
            this.totalPlayers.set(response.pagination.total);
            this.totalPages.set(response.pagination.totalPages);
            // Update page in filter service
            this.filtersService.updateFilter('currentPage', response.pagination.page);
          }

          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error loading players:', err);
          this.error.set(err.message || 'Error al cargar jugadores. El backend puede estar tardando demasiado.');
          this.loading.set(false);
        }
      });
  }

  onSearch(query: string): void {
    this.filtersService.updateFilters({
      searchQuery: query,
      currentPage: 1
    });
    this.loadPlayers();
  }

  setViewMode(mode: 'cards' | 'table'): void {
    this.filtersService.updateFilter('viewMode', mode);
  }

  filterByGender(gender: 'M' | 'F'): void {
    this.filtersService.updateFilters({
      currentGender: gender,
      showTopRated: false,
      currentPage: 1
    });
    this.loadPlayers();
  }

  clearGenderFilter(): void {
    this.filtersService.updateFilters({
      currentGender: undefined,
      showTopRated: false,
      currentPage: 1
    });
    this.loadPlayers();
  }

  toggleTopRated(): void {
    this.filtersService.updateFilters({
      showTopRated: !this.showTopRated(),
      currentPage: 1
    });
    this.loadPlayers();
  }

  onFifaVersionChange(): void {
    this.filtersService.updateFilter('currentPage', 1);
    this.loadPlayers();
  }

  applyFilters(): void {
    this.filtersService.updateFilter('currentPage', 1);
    this.loadPlayers();
  }

  clearAllFilters(): void {
    // Reset all filters to default
    this.filtersService.resetFilters();

    // Reload players with no filters
    this.loadPlayers();

    this.toastService.success('All filters cleared');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.filtersService.updateFilter('currentPage', page);
    this.loadPlayers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Páginas alrededor de la actual
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      // Siempre mostrar última página
      pages.push(total);
    }

    return pages;
  }

  getMainPosition(positions: string): string {
    if (!positions) return '-';
    return positions.split(',')[0].trim();
  }

  generateShortName(fullName: string): string {
    if (!fullName) return '';

    const names = fullName.split(' ');
    if (names.length <= 2) {
      return fullName;
    }
    // Tomar primer nombre y primer apellido
    return `${names[0]} ${names[names.length - 1]}`;
  }

  // Métodos para el modal de creación/edición
  openCreateModal(): void {
    this.selectedPlayer.set(null);
    this.showPlayerModal.set(true);
  }

  openEditModal(player: FifaPlayer): void {
    this.selectedPlayer.set(player);
    this.showPlayerModal.set(true);
  }

  closePlayerModal(): void {
    this.showPlayerModal.set(false);
    this.selectedPlayer.set(null);
  }

  onPlayerSaved(player: FifaPlayer): void {

    const isEdit = this.selectedPlayer() !== null;
    const playerName = player.short_name || player.long_name;

    // Actualizar caché con los datos frescos que devolvió el PUT/POST
    this.playersService.updatePlayerCache(player);

    if (isEdit) {
      this.toastService.success(`Player "${playerName}" updated successfully`);
    } else {
      this.toastService.success(`Player "${playerName}" created successfully`);
    }

    // Hard refresh: Recargar lista completa desde servidor
    ('🔄 Hard refresh: Reloading players from server');
    this.loadPlayers();
  }

  confirmDelete(player: FifaPlayer): void {
    const playerName = player.short_name || player.long_name;
    const confirmed = confirm(`Are you sure you want to delete "${playerName}"? This action cannot be undone.`);

    if (confirmed) {
      this.deletePlayer(player);
    }
  }

  deletePlayer(player: FifaPlayer): void {

    this.playersService.deletePlayer(player.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const playerName = player.short_name || player.long_name;

          // Invalidar caché para forzar recarga desde servidor
          this.playersService.invalidatePlayersCache(player.id);

          this.toastService.success(`Player "${playerName}" deleted successfully`);

          // Hard refresh: Recargar lista completa desde servidor
          ('� Hard refresh: Reloading players from server after delete');
          this.loadPlayers();
        },
        error: (err) => {
          console.error('❌ Error deleting player:', err);
          this.toastService.error(err.message || 'Error deleting player. Please check your authentication.');
        }
      });
  }

  toggleExportDropdown(): void {
    this.showExportDropdown.set(!this.showExportDropdown());
  }

  exportPlayers(format: 'csv' | 'xlsx'): void {
    (`📥 Exporting players as ${format.toUpperCase()}`);

    // Close dropdown
    this.showExportDropdown.set(false);

    // Build filters object from current filter state
    const filters: any = {};

    if (this.searchQuery()) {
      filters.name = this.searchQuery();
    }

    if (this.selectedPosition) {
      filters.position = this.selectedPosition;
    }

    if (this.selectedOverallRange) {
      const [min, max] = this.selectedOverallRange.split('-').map(Number);
      filters.overallMin = min;
      filters.overallMax = max;
    }

    if (this.selectedFifaVersion) {
      filters.fifaVersion = this.selectedFifaVersion;
    }

    if (this.selectedClub) {
      filters.clubName = this.selectedClub;
    }

    // Set loading state
    this.isExporting.set(true);

    // Call service to export
    this.playersService.exportPlayers(format, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          const extension = format === 'csv' ? 'csv' : 'xlsx';
          link.download = `fifa-players-${timestamp}.${extension}`;

          // Trigger download
          document.body.appendChild(link);
          link.click();

          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          // Show success message with proper format name
          const formatName = format === 'csv' ? 'CSV' : 'Excel';
          this.toastService.success(`Players exported successfully as ${formatName}`);

          // Reset loading state
          this.isExporting.set(false);
        },
        error: (err) => {
          console.error('❌ Error exporting players:', err);
          this.toastService.error(err.message || 'Error exporting players. Please check your authentication.');

          // Reset loading state
          this.isExporting.set(false);
        }
      });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/images/avatar-fifa-player.png';
    img.classList.add('avatar-player');
  }
}
