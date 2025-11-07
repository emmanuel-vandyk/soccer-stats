import { Component, OnInit, signal, computed, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { PlayersService } from '../../../core/services';
import { FifaPlayer, PlayerRadarStats, PlayerRadarStatsResponse, PlayerTimeline } from '../../../core/models';
import { ProxyImagePipe } from '../../../shared/pipes/proxy-image.pipe';

// Registrar Chart.js components
Chart.register(...registerables);

type ViewMode = 'overview' | 'radar' | 'timeline';

@Component({
  selector: 'app-player-detail',
  imports: [CommonModule, BaseChartDirective, ProxyImagePipe],
  template: `
    <div class="player-detail" [attr.data-view]="currentView()">
      <!-- Header with navigation -->
      <header class="detail-header">
        <button
          class="back-button"
          (click)="goBack()"
          aria-label="Go back to players list"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Players
        </button>

        <!-- View Toggle -->
        <nav class="view-toggle" role="tablist">
          <button
            class="tab-button"
            [class.active]="currentView() === 'overview'"
            (click)="setView('overview')"
            role="tab"
            [attr.aria-selected]="currentView() === 'overview'"
          >
            Overview
          </button>
          <button
            class="tab-button"
            [class.active]="currentView() === 'radar'"
            (click)="setView('radar')"
            role="tab"
            [attr.aria-selected]="currentView() === 'radar'"
          >
            Radar Stats
          </button>
          <button
            class="tab-button"
            [class.active]="currentView() === 'timeline'"
            (click)="setView('timeline')"
            role="tab"
            [attr.aria-selected]="currentView() === 'timeline'"
          >
            Timeline
          </button>
        </nav>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading player details...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <p>{{ error() }}</p>
          <button class="retry-button" (click)="loadPlayerData()">Retry</button>
        </div>
      } @else if (player()) {
        <!-- Main content -->
        <main class="detail-content">

          <!-- Overview View -->
          @if (currentView() === 'overview') {
            <div class="overview-view">
              <section class="player-hero">
                <div class="player-image-section">
                  <img
                    [src]="player()!.player_face_url | proxyImage"
                    [alt]="getDisplayName()"
                    class="player-image"
                    style="view-transition-name: player-image"
                    (error)="onImageError($event)"
                  />
                  <div class="overall-badge">
                    <span class="overall-number">{{ player()!.overall }}</span>
                    <span class="overall-label">OVR</span>
                  </div>
                </div>

                <div class="player-info">
                  <h1 class="player-name">{{ getDisplayName() }}</h1>
                  <div class="player-meta">
                    <span class="position">{{ getMainPosition() }}</span>
                    <span class="separator">•</span>
                    <span class="club">{{ player()!.club_name }}</span>
                    <span class="separator">•</span>
                    <span class="nationality">{{ player()!.nationality_name }}</span>
                  </div>
                  <div class="player-details">
                    <div class="detail-item">
                      <span class="label">Age:</span>
                      <span class="value">{{ player()!.age }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Potential:</span>
                      <span class="value">{{ player()!.potential }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Value:</span>
                      <span class="value">{{ formatValue(player()!.value_eur) || 'Not Available' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">FIFA Version:</span>
                      <span class="value">{{ player()!.fifa_version }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Skills Grid -->
              <section class="skills-section">
                <h2>Player Skills</h2>
                <div class="skills-grid">
                  <div class="skill-card">
                    <div class="skill-icon pace"></div>
                    <span class="skill-label">Pace</span>
                    <span class="skill-value">{{ player()!.pace || 0 }}</span>
                  </div>
                  <div class="skill-card">
                    <div class="skill-icon shooting"></div>
                    <span class="skill-label">Shooting</span>
                    <span class="skill-value">{{ player()!.shooting || 0 }}</span>
                  </div>
                  <div class="skill-card">
                    <div class="skill-icon passing"></div>
                    <span class="skill-label">Passing</span>
                    <span class="skill-value">{{ player()!.passing || 0 }}</span>
                  </div>
                  <div class="skill-card">
                    <div class="skill-icon dribbling"></div>
                    <span class="skill-label">Dribbling</span>
                    <span class="skill-value">{{ player()!.dribbling || 0 }}</span>
                  </div>
                  <div class="skill-card">
                    <div class="skill-icon defending"></div>
                    <span class="skill-label">Defending</span>
                    <span class="skill-value">{{ player()!.defending || 0 }}</span>
                  </div>
                  <div class="skill-card">
                    <div class="skill-icon physic"></div>
                    <span class="skill-label">Physical</span>
                    <span class="skill-value">{{ player()!.physic || 0 }}</span>
                  </div>
                </div>
              </section>
            </div>
          }

          <!-- Radar View -->
          @if (currentView() === 'radar') {
            <div class="radar-view">
              @if (radarLoading()) {
                <div class="chart-loading">Loading radar chart...</div>
              } @else if (radarError()) {
                <div class="chart-error">
                  <p>{{ radarError() }}</p>
                  <button (click)="loadRadarStats()">Retry</button>
                </div>
              } @else if (radarChartData()) {
                <section class="radar-section">
                  <h2>{{ getDisplayName() }} - Skill Radar</h2>
                  <div class="chart-container">
                    <canvas
                      baseChart
                      [data]="radarChartData()!"
                      [options]="radarChartOptions"
                      [type]="radarChartType"
                    ></canvas>
                  </div>
                </section>
              }
            </div>
          }

          <!-- Timeline View -->
          @if (currentView() === 'timeline') {
            <div class="timeline-view">
              @if (timelineLoading()) {
                <div class="chart-loading">Loading evolution timeline...</div>
              } @else if (timelineError()) {
                <div class="chart-error">
                  <p>{{ timelineError() }}</p>
                  <button (click)="loadTimelineStats()">Retry</button>
                </div>
              } @else if (timelineChartData()) {
                <section class="timeline-section">
                  <h2>{{ getDisplayName() }} - FIFA Evolution</h2>
                  <div class="chart-container">
                    <canvas
                      baseChart
                      [data]="timelineChartData()!"
                      [options]="timelineChartOptions"
                      [type]="timelineChartType"
                    ></canvas>
                  </div>
                </section>
              }
            </div>
          }

        </main>
      }
    </div>
  `,
  styles: [`
    .player-detail {
      min-height: 100vh;
      background: url('/images/background-dark.webp') center / cover no-repeat;
      color: #f6f6f6;
      padding: 0;
      position: relative;
      overflow-x: hidden;
      background-attachment: fixed;
    }

    /* Header */
    .detail-header {
      background: rgba(255, 255, 255, 0.95);
      color: #f6f6f6;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      color: #374151;
      font-size: 1rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .back-button:hover {
      color: #3b82f6;
    }

    .view-toggle {
      display: flex;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 4px;
    }

    .tab-button {
      padding: 0.5rem 1rem;
      border: none;
      background: transparent;
      color: #64748b;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-button.active {
      background: white;
      color: #3b82f6;
    }

    /* Content */
    .detail-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Overview */
    .overview-view {
      color: #1f2937;
    }

    .player-hero {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
      align-items: start;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .player-image-section {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 100%;
    }

    .player-image {
      width: 220px;
      height: 260px;
      object-fit: cover;
      border-radius: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0 1rem;
      border: 5px solid white;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
    }

    .player-image:hover {
      transform: scale(1.05);
    }

    .overall-badge {
      position: absolute;
      top: -15px;
      right: -15px;
      background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
      color: #1a1a1a;
      padding: 1rem;
      border-radius: 100%;
      font-weight: bold;
      text-align: center;
      height: 4.2rem;
      width: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(255, 215, 0, 0.5);
      border: 4px solid white;
    }

    .overall-number {
      display: block;
      font-size: 2rem;
      line-height: 1;
      font-weight: 900;
      margin-top: .5rem;
    }

    .overall-label {
      display: block;
      font-size: 0.65rem;
      opacity: 0.8;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .player-info h1 {
      font-size: 3.5rem;
      margin: 0 0 1rem 0;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .player-meta {
      font-size: 1.3rem;
      margin-bottom: 2.5rem;
      color: #6b7280;
      font-weight: 500;
    }

    .player-meta .position {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 1rem;
      font-weight: 600;
    }

    .separator {
      margin: 0 0.75rem;
      opacity: 0.4;
    }

    .player-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
    }

    .detail-item {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .detail-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .detail-item .label {
      font-size: 0.85rem;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-item .value {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1f2937;
    }

    /* Skills */
    .skills-section {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .skills-section h2 {
      margin: 0 0 3rem 0;
      font-size: 2.5rem;
      text-align: center;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 2rem;
    }

    .skill-card {
      background: white;
      border-radius: 16px;
      padding: 2rem 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .skill-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--skill-color-start) 0%, var(--skill-color-end) 100%);
    }

    .skill-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      border-color: var(--skill-color-start);
    }

    .skill-card:nth-child(1) {
      --skill-color-start: #ef4444;
      --skill-color-end: #dc2626;
    }

    .skill-card:nth-child(2) {
      --skill-color-start: #f59e0b;
      --skill-color-end: #d97706;
    }

    .skill-card:nth-child(3) {
      --skill-color-start: #10b981;
      --skill-color-end: #059669;
    }

    .skill-card:nth-child(4) {
      --skill-color-start: #8b5cf6;
      --skill-color-end: #7c3aed;
    }

    .skill-card:nth-child(5) {
      --skill-color-start: #3b82f6;
      --skill-color-end: #2563eb;
    }

    .skill-card:nth-child(6) {
      --skill-color-start: #6b7280;
      --skill-color-end: #4b5563;
    }


    .skill-label {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .skill-value {
      display: block;
      font-size: 2.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--skill-color-start) 0%, var(--skill-color-end) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Charts */
    .radar-view, .timeline-view {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%);
      border-radius: 24px;
      padding: 3rem;
      margin: 0 auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .radar-section {
      margin-bottom: 3rem;
    }

    .radar-section h2, .timeline-section h2 {
      text-align: center;
      margin-bottom: 3rem;
      font-size: 2.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .chart-container {
      max-width: 700px;
      height: 450px;
      margin: 0 auto;
      padding: 2.5rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .chart-loading, .chart-error {
      text-align: center;
      padding: 4rem;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .chart-error button {
      margin-top: 1.5rem;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .chart-error button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    /* Loading & Error States */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      color: white;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      text-align: center;
      padding: 3rem;
      color: white;
    }

    .retry-button {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    }

    /* Responsive */
    /* Tablet styles */
    @media (max-width: 1024px) {
      .detail-container {
        padding: 1.5rem;
      }

      .player-hero {
        gap: 3rem;
      }

      .player-info h1 {
        font-size: 2.5rem;
      }

      .skills-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .chart-container {
        height: 400px;
        padding: 2rem;
      }

      .radar-section h2,
      .timeline-section h2 {
        font-size: 2rem;
        margin-bottom: 2rem;
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .detail-header {
        flex-direction: column;
        gap: 12px;
        padding: 16px;

        .back-btn {
          width: 100%;
          justify-content: center;
        }

        .header-actions {
          width: 100%;
          justify-content: space-between;
        }
      }

      .detail-container {
        padding: 16px;
      }

      .player-hero {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 24px;
        padding: 24px 16px;

        .player-avatar {
          width: 200px;
          height: 200px;
          margin: 0 auto;
        }
      }

      .player-info {
        h1 {
          font-size: 28px;
        }

        .player-meta {
          flex-direction: column;
          gap: 12px;
          align-items: center;

          .meta-item {
            width: 100%;
            justify-content: center;
            padding: 12px;
          }
        }

        .rating-badges {
          justify-content: center;
          gap: 12px;

          .rating-badge {
            padding: 12px 20px;

            .rating-label {
              font-size: 11px;
            }

            .rating-value {
              font-size: 28px;
            }
          }
        }
      }

      .tabs-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 0 8px;

        .tab-list {
          min-width: max-content;

          .tab-btn {
            min-width: 120px;
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      }

      .tab-content {
        padding: 16px;
      }

      .skills-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .skill-card {
        padding: 12px;

        .skill-name {
          font-size: 11px;
        }

        .skill-value {
          font-size: 20px;
        }

        .skill-bar {
          height: 4px;
        }
      }

      .stats-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-card {
        padding: 16px;

        h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
      }

      .stat-item {
        padding: 10px;

        .stat-label {
          font-size: 12px;
        }

        .stat-value {
          font-size: 15px;
        }
      }

      .chart-container {
        padding: 16px;
        height: 300px;
        max-width: 100%;
        overflow: hidden;

        h3 {
          font-size: 16px;
          margin-bottom: 12px;
        }
      }

      .radar-section,
      .timeline-section {
        padding: 2rem 0;
        margin-bottom: 2rem;
        width: 100%;

        h2 {
          font-size: 22px;
          margin-bottom: 1.5rem;
          text-align: center;
          overflow-wrap: break-word;
          padding: 0 8px;
        }
      }

      .radar-view,
      .timeline-view {
        width: 100%;
        padding: 0 .5rem;
        overflow-x: hidden;
      }

      .chart-loading,
      .chart-error {
        padding: 2rem 1rem;
        font-size: 14px;

        button {
          padding: 10px 16px;
          font-size: 14px;
        }
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .info-item {
        padding: 12px;

        .info-label {
          font-size: 12px;
        }

        .info-value {
          font-size: 14px;
        }
      }

      .loading-skeleton,
      .error-state {
        padding: 32px 16px;

        h2, h3 {
          font-size: 20px;
        }

        p {
          font-size: 14px;
        }
      }
    }

    /* Small mobile styles */
    @media (max-width: 480px) {
      .player-hero .player-avatar {
        width: 160px;
        height: 160px;
      }

      .player-info h1 {
        font-size: 24px;
      }

      .rating-badges .rating-badge {
        padding: 10px 16px;

        .rating-value {
          font-size: 24px;
        }
      }

      .skills-grid {
        grid-template-columns: 1fr;
      }

      .tab-list .tab-btn {
        min-width: 100px;
        padding: 10px 16px;
        font-size: 13px;
      }

      .chart-container {
        height: 250px;
        padding: 12px;
      }

      .radar-section h2,
      .timeline-section h2 {
        font-size: 20px;
        margin-bottom: 1rem;
      }

      .chart-loading,
      .chart-error {
        padding: 1.5rem 0.75rem;
        font-size: 13px;

        button {
          padding: 8px 14px;
          font-size: 13px;
        }
      }
    }
  `]
})
export class PlayerDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);

  // State signals
  player = signal<FifaPlayer | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // View management
  currentView = signal<ViewMode>('overview');

  // Radar chart state
  radarStats = signal<PlayerRadarStats | null>(null);
  radarLoading = signal(false);
  radarError = signal<string | null>(null);

  // Timeline chart state
  timelineStats = signal<PlayerTimeline | null>(null);
  timelineLoading = signal(false);
  timelineError = signal<string | null>(null);

  // Chart configurations
  radarChartType: ChartType = 'radar';
  timelineChartType: ChartType = 'line';

  radarChartData = computed(() => {
    const stats = this.radarStats();
    if (!stats || !stats.stats) return null;

    return {
      labels: ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'],
      datasets: [{
        label: stats.playerName,
        data: [
          stats.stats.pace || 0,
          stats.stats.shooting || 0,
          stats.stats.passing || 0,
          stats.stats.dribbling || 0,
          stats.stats.defending || 0,
          stats.stats.physic || 0
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  });

  radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Allow flexible height
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: window.innerWidth < 768 ? 11 : 14,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  timelineChartData = computed(() => {
    const timeline = this.timelineStats();
    if (!timeline || !timeline.timeline) return null;

    // Fix: Support both fifa_version (snake_case) and fifaVersion (camelCase)
    // Backend inconsistency: some endpoints return camelCase, others snake_case
    const versions = timeline.timeline.map((t: any) => `FIFA ${t.fifaVersion || t.fifa_version || 'N/A'}`);
    const overallData = timeline.timeline.map((t: any) => t.overall);

    return {
      labels: versions,
      datasets: [{
        label: 'Overall Rating',
        data: overallData,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  });

  timelineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Allow flexible height
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        ticks: {
          stepSize: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const playerId = Number(params['id']);
      if (playerId) {
        this.loadPlayerData(playerId);
      }
    });
  }

  ngOnDestroy(): void {
  }

  loadPlayerData(playerId?: number): void {
    const id = playerId || Number(this.route.snapshot.params['id']);

    this.loading.set(true);
    this.error.set(null);

    this.playersService.getPlayerById(id).subscribe({
      next: (response) => {
        this.player.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load player details. Please try again.');
        this.loading.set(false);
        console.error('Error loading player:', err);
      }
    });
  }

  setView(view: ViewMode): void {
    if (view === this.currentView()) return;

    this.currentView.set(view);

    // Load data for the specific view
    const playerId = this.player()?.id;
    if (!playerId) {
      console.warn('No player ID available');
      return;
    }

    if (view === 'radar' && !this.radarStats()) {
      this.loadRadarStats(playerId);
    } else if (view === 'timeline' && !this.timelineStats()) {
      this.loadTimelineStats(playerId);
    }
  }

  loadRadarStats(playerId?: number): void {
    const id = playerId || this.player()?.id;
    if (!id) return;

    this.radarLoading.set(true);
    this.radarError.set(null);

    // Obtener datos del endpoint protegido
    this.playersService.getPlayerRadarStats(id).subscribe({
      next: (response) => {

        // Transformar la respuesta del backend al formato del componente
        const backendData = response.data;
        const radarData: PlayerRadarStats = {
          playerId: backendData.playerInfo.id,
          playerName: this.generateShortName(backendData.playerInfo.shortName || backendData.playerInfo.longName),
          stats: {
            pace: backendData.radarChart.values[0] || 0,      // Pace
            shooting: backendData.radarChart.values[1] || 0,  // Shooting
            passing: backendData.radarChart.values[2] || 0,   // Passing
            dribbling: backendData.radarChart.values[3] || 0, // Dribbling
            defending: backendData.radarChart.values[4] || 0, // Defending
            physic: backendData.radarChart.values[5] || 0     // Physical
          }
        };

        this.radarStats.set(radarData);
        this.radarLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading radar stats:', err);

        const player = this.player();
        if (player) {
          const radarData: PlayerRadarStats = {
            playerId: player.id,
            playerName: this.generateShortName(player.short_name || player.long_name),
            stats: {
              pace: player.pace || 0,
              shooting: player.shooting || 0,
              passing: player.passing || 0,
              dribbling: player.dribbling || 0,
              defending: player.defending || 0,
              physic: player.physic || 0
            }
          };
          this.radarStats.set(radarData);
        } else {
          this.radarError.set('Failed to load radar stats.');
        }
        this.radarLoading.set(false);
      }
    });
  }

  loadTimelineStats(playerId?: number): void {
    const id = playerId || this.player()?.id;
    if (!id) return;

    this.timelineLoading.set(true);
    this.timelineError.set(null);

    this.playersService.getPlayerTimeline(id).subscribe({
      next: (response) => {

        if (response.data?.timeline && Array.isArray(response.data.timeline)) {
          response.data.timeline.forEach((entry: any, index: number) => {
            console.log(`Timeline entry ${index}:`, {
              fifa_version: entry.fifa_version,
              fifa_version_type: typeof entry.fifa_version,
              overall: entry.overall,
              all_fields: entry
            });
          });
        }

        this.timelineStats.set(response.data);
        this.timelineLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading timeline stats:', err);

        const player = this.player();
        if (player) {
          const cleanVersion = player.fifa_version.replace(/[^\d]/g, '');
          const currentVersion = parseInt(cleanVersion) || 23;


          const timeline: PlayerTimeline = {
            playerId: player.id,
            playerName: this.generateShortName(player.short_name || player.long_name),
            timeline: []
          };

          const startVersion = Math.max(15, currentVersion - 4);
          for (let version = startVersion; version <= currentVersion; version++) {
            const ageOffset = currentVersion - version;
            const overallVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, o +1

            timeline.timeline.push({
              fifa_version: version.toString(),
              fifa_update: '1',
              overall: Math.max(40, Math.min(99, player.overall - (ageOffset * 1) + overallVariation)),
              pace: player.pace || 0,
              shooting: player.shooting || 0,
              passing: player.passing || 0,
              dribbling: player.dribbling || 0,
              defending: player.defending || 0,
              physic: player.physic || 0
            });
          }

          this.timelineStats.set(timeline);
        } else {
          this.timelineError.set('Failed to load evolution timeline.');
        }
        this.timelineLoading.set(false);
      }
    });
  }

  goBack(): void {

    if ('startViewTransition' in document && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        this.router.navigate(['/players']);
      });
    } else {
      this.router.navigate(['/players']);
    }
  }

  getMainPosition(): string {
    return this.player()?.player_positions.split(',')[0].trim() || '';
  }

  getDisplayName(): string {
    const player = this.player();
    if (!player) return '';
    return this.generateShortName(player.short_name || player.long_name);
  }

  private generateShortName(fullName: string): string {
    if (!fullName) return '';

    const names = fullName.split(' ');
    if (names.length <= 2) {
      return fullName;
    }
    return `${names[0]} ${names[names.length - 1]}`;
  }

  formatValue(value: number): string {
    return this.playersService.formatValue(value);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/images/avatar-fifa-player.png';
  }
}
