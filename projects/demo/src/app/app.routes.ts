import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'live-demo',
    loadComponent: () =>
      import('./pages/live-demo/live-demo.component').then((m) => m.LiveDemoComponent),
  },
  {
    path: 'theming',
    loadComponent: () =>
      import('./pages/theming/theming.component').then((m) => m.ThemingComponent),
  },
  {
    path: 'headless',
    loadComponent: () =>
      import('./pages/headless/headless.component').then((m) => m.HeadlessComponent),
  },
  {
    path: 'ga-consent-mode',
    loadComponent: () =>
      import('./pages/ga-consent-mode/ga-consent-mode.component').then(
        (m) => m.GaConsentModeComponent,
      ),
  },
];
