import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="p-8 rounded-lg shadow-lg mx-auto">
            <div class="hero-content">
            <h1>Explore the World of Soccer Stats</h1>
            <p>Discover detailed player cards for both men's and women's soccer, featuring stats, skills, and more.</p>

            <div class="hero-buttons">
              <button
                class="btn-primary"
                [routerLink]="!isAuthenticated() ? '/auth/login' : '/players'">
                Get Started
              </button>
              <button
                class="btn-secondary"
                [routerLink]="!isAuthenticated() ? '/auth/register' : '/players'">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Latest Updates -->
      <section class="updates">
        <div class="updates-grid">
          <div class="update-card">
            <img src="/images/new-cards-available.png" style="height: 40vh; width: 100%; object-fit: cover;" />
            <h3>New Player Cards Added</h3>
            <p>We've updated our database with the latest player cards from the recent season. Check out the new additions!</p>
            <a routerLink="/players" class="link">View Updates</a>
          </div>

          <div class="update-card">
            <img src="/images/womens-soccer-art.webp" style="height: 40vh; width: auto; object-fit: cover;" />
            <h3>Women's Soccer Spotlight</h3>
            <p>Explore the rising stars and seasoned veterans of women's soccer. Get detailed insights into their careers.</p>
            <a routerLink="/players" [queryParams]="{gender: 'F'}" class="link">Explore</a>
          </div>

          <div class="update-card">
            <img src="/images/art-stars.webp" style="height: 40vh; width: 100%; object-fit: cover;" />
            <h3>Men's Soccer Highlights</h3>
            <p>Stay up-to-date with the latest news and highlights from the world of men's soccer. From top scorers to game-changers.</p>
            <a routerLink="/players" [queryParams]="{gender: 'M'}" class="link">View Highlights</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
    }

    .hero {
      color: white;
      padding: 80px 2rem;
      text-align: center;
      height: 100%;

      .hero-content {
        background: url('/images/fif-worldcup-stadium.webp');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        margin: 0 auto;
        padding: 6rem;
        height: 50vh;
        width: 60vw;
        border-radius: 12px;
        filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        position: relative;

        /* Overlay para mejorar legibilidad del texto */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
          z-index: 1;
        }

        /* Asegurar que el contenido esté por encima del overlay */
        * {
          position: relative;
          z-index: 2;
        }
        h1 {
          font-size: 48px;
          font-weight: bold;
          margin: 0 0 20px 0;
        }

        p {
          font-size: 20px;
          margin: 0 0 40px 0;
          opacity: 0.9;
        }
      }

      .hero-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;

        button {
          padding: 14px 32px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #1d4ed8;
          color: #ffffff;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        }

        .btn-secondary {
          background: white;
          color: #1d4ed8;
          border: 2px solid white;

          &:hover {
            background: rgba(255, 255, 255, 0.9);
            color: #3b82f6;
          }
        }
      }
    }

    .updates {
      background: #f9fafb;
      padding: 60px 24px;

      .updates-grid {
        max-width: 1400px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }

      .update-card {
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        h3 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 16px 0;
        }

        p {
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.6;
        }

        .link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    /* Tablet styles */
    @media (max-width: 1024px) {
      .hero {
        padding: 60px 1.5rem;

        .hero-content {
          width: 80vw;
          padding: 4rem;
          height: 45vh;

          h1 {
            font-size: 42px;
          }

          p {
            font-size: 19px;
          }
        }
      }

      .updates {
        padding: 48px 20px;

        .updates-grid {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .hero {
        padding: 40px 16px;

        .hero-content {
          width: 90vw;
          padding: 2.5rem 1.5rem;
          height: auto;
          min-height: 40vh;

          h1 {
            font-size: 32px;
            margin-bottom: 16px;
          }

          p {
            font-size: 16px;
            margin-bottom: 32px;
          }
        }

        .hero-buttons {
          gap: 12px;

          button {
            padding: 12px 24px;
            font-size: 15px;
          }
        }
      }

      .updates {
        padding: 40px 16px;

        .updates-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .update-card {
          padding: 20px;
          max-width: 100%;
          overflow: hidden; /* Evitar desbordamiento */

          img {
            height: 30vh !important;
            width: 100%;
            border-radius: 8px;
            margin-bottom: 16px;
            object-fit: cover;
          }

          h3 {
            font-size: 18px;
            margin-bottom: 12px;
            overflow-wrap: break-word;
          }

          p {
            font-size: 14px;
            margin-bottom: 12px;
            overflow-wrap: break-word;
          }

          .link {
            font-size: 14px;
          }
        }
      }
    }

    /* Small mobile styles */
    @media (max-width: 480px) {
      .hero {
        padding: 32px 12px;

        .hero-content {
          width: 95vw;
          padding: 2rem 1rem;

          h1 {
            font-size: 26px;
          }

          p {
            font-size: 15px;
          }
        }

        .hero-buttons {
          flex-direction: column;
          width: 100%;

          button {
            width: 100%;
            padding: 14px;
          }
        }
      }

      .updates {
        padding: 32px 12px;

        .update-card {
          padding: 16px;
          max-width: 100%;

          img {
            height: 25vh !important;
            width: 100%;
          }

          h3 {
            font-size: 17px;
          }
        }
      }
    }
  `]
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
}
