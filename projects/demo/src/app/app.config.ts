import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideCookieConsent,
  ANALYTICS_PRESET,
  MARKETING_PRESET,
  FUNCTIONAL_PRESET,
  SOCIAL_PRESET,
} from '@ngxt/cookie-consent';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCookieConsent({
      privacyPolicyUrl: 'https://example.com/privacy',
      imprintUrl: 'https://example.com/imprint',
      defaultLanguage: 'en',
      availableLanguages: ['en', 'fr'],
      showLanguageSwitcher: true,
      position: 'bottom-bar',
      theme: 'default',
      categories: [ANALYTICS_PRESET, MARKETING_PRESET, FUNCTIONAL_PRESET, SOCIAL_PRESET],
    }),
  ],
};
