import { Component } from '@angular/core';

@Component({
  selector: 'app-player-skeleton',
  template: `
    <div class="player-skeleton">
      <!-- Card background - same as player card -->
      <div class="card-background"></div>

      <!-- Rating placeholder top left -->
      <div class="skeleton-rating">
        <div class="skeleton-overall"></div>
        <div class="skeleton-position"></div>
      </div>

      <!-- Player image placeholder -->
      <div class="skeleton-player-image"></div>

      <!-- Player name placeholder -->
      <div class="skeleton-name"></div>

      <!-- Stats placeholder -->
      <div class="skeleton-stats">
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
        <div class="skeleton-stat"></div>
      </div>
    </div>
  `,
  styles: [`
    .player-skeleton {
      position: relative;
      width: 280px;
      height: 380px;
      background: transparent;
      animation: pulse 1.5s ease-in-out infinite;
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
      opacity: 0.3;
    }

    .skeleton-rating {
      position: absolute;
      top: 3rem;
      left: 2.5rem;
      z-index: 10;
      text-align: center;
    }

    .skeleton-overall {
      width: 40px;
      height: 40px;
      background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      margin-bottom: 4px;
      animation: shimmer 2s infinite;
    }

    .skeleton-position {
      width: 35px;
      height: 14px;
      background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      animation: shimmer 2s infinite;
    }

    .skeleton-player-image {
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 215px;
      background: linear-gradient(90deg, rgba(226, 232, 240, 0.4) 25%, rgba(203, 213, 225, 0.4) 50%, rgba(226, 232, 240, 0.4) 75%);
      background-size: 200% 100%;
      border-radius: 50%;
      animation: shimmer 2s infinite;
      z-index: 5;
    }

    .skeleton-name {
      position: absolute;
      top: 256px;
      left: 50%;
      transform: translateX(-50%);
      width: 180px;
      height: 24px;
      background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      animation: shimmer 2s infinite;
      z-index: 5;
    }

    .skeleton-stats {
      position: absolute;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      width: 240px;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      padding: 0 2rem;
      z-index: 5;
    }

    .skeleton-stat {
      width: 20px;
      height: 35px;
      background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .player-skeleton {
        width: 240px;
        height: 320px;
      }

      .skeleton-rating {
        top: 2.2rem;
        left: 1.8rem;
      }

      .skeleton-overall {
        width: 35px;
        height: 35px;
      }

      .skeleton-position {
        width: 30px;
        height: 12px;
      }

      .skeleton-player-image {
        top: 55px;
        width: 120px;
        height: 180px;
      }

      .skeleton-name {
        top: 210px;
        width: 160px;
        height: 20px;
      }

      .skeleton-stats {
        bottom: 2.2rem;
        width: 210px;
        padding: 0 1.2rem;
      }

      .skeleton-stat {
        width: 18px;
        height: 30px;
      }
    }

    /* Small mobile styles */
    @media (max-width: 480px) {
      .player-skeleton {
        width: 220px;
        height: 300px;
      }

      .skeleton-rating {
        top: 2rem;
        left: 1.6rem;
      }

      .skeleton-overall {
        width: 32px;
        height: 32px;
      }

      .skeleton-position {
        width: 28px;
        height: 11px;
      }

      .skeleton-player-image {
        top: 50px;
        width: 110px;
        height: 165px;
      }

      .skeleton-name {
        top: 195px;
        width: 140px;
        height: 18px;
      }

      .skeleton-stats {
        bottom: 2rem;
        width: 190px;
        padding: 0 1rem;
      }

      .skeleton-stat {
        width: 16px;
        height: 28px;
      }
    }
  `]
})
export class PlayerSkeletonComponent {}
