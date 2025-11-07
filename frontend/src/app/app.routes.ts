import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
// import { homeResolver, playerListResolver, playerDetailResolver } from './core/resolvers';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    // resolve: {
    //   featuredPlayers: homeResolver
    // }
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'document',
    canActivate: [authGuard],
    loadComponent: () => import('./features/api-docs/api-docs.component').then(m => m.ApiDocsComponent)
  },
  {
    path: 'players',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/players/player-list/player-list.component').then(m => m.PlayerListComponent)
        // resolve: {
        //   initialPlayers: playerListResolver
        // },
        // runGuardsAndResolvers: 'paramsOrQueryParamsChange'
      },
      {
        path: 'top-rated',
        loadComponent: () => import('./features/players/top-rated/top-rated.component').then(m => m.TopRatedComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/players/player-detail/player-detail.component').then(m => m.PlayerDetailComponent)
        // resolve: {
        //   player: playerDetailResolver
        // }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
