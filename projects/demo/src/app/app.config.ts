import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideCookieConsent,
  ANALYTICS_PRESET,
  MARKETING_PRESET,
  FUNCTIONAL_PRESET,
  SOCIAL_PRESET,
} from '@ngrithms/cookie-consent';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCookieConsent({
      privacyPolicyUrl: 'https://example.com/privacy',
      imprintUrl: 'https://example.com/imprint',
      defaultLanguage: 'en',
      // 'brand-en' is registered here so the language switcher can reflect it as the active
      // language when the Theming page's "Brand makeover" toggle activates it. Otherwise the
      // banner's <select> would render empty (no matching <option>) whenever 'brand-en' was
      // active.
      availableLanguages: ['en', 'fr', 'brand-en'],
      showLanguageSwitcher: true,
      position: 'bottom-bar',
      theme: 'default',
      categories: [ANALYTICS_PRESET, MARKETING_PRESET, FUNCTIONAL_PRESET, SOCIAL_PRESET],
      customLanguages: {
        'brand-en': {
          languageKey: 'brand-en',
          languageName: 'Brand (English)',
          fallback: 'en',
          translations: {
            'banner.customize': 'Settings',
          },
        },
      },
    }),
  ],
};
