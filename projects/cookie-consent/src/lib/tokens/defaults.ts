import { Category } from '../types/category';
import { CookieConsentConfig } from '../types/config';

/** Key of the implicit, always-granted essential category. */
export const ESSENTIAL_CATEGORY_KEY = 'essential';

/**
 * The implicit `essential` category. Always present, always granted, never toggleable.
 * Users can override its label/description/items via `config.essential`.
 */
export const DEFAULT_ESSENTIAL_CATEGORY: Category = {
  key: ESSENTIAL_CATEGORY_KEY,
  name: {
    en: 'Essential',
    fr: 'Essentiels',
  },
  description: {
    en: 'Required for the site to function. Cannot be disabled.',
    fr: 'Nécessaire au fonctionnement du site. Ne peut être désactivé.',
  },
  items: [
    {
      key: 'session',
      name: { en: 'Session', fr: 'Session' },
      description: {
        en: 'Keeps you signed in and remembers your preferences for the duration of your visit.',
        fr: 'Vous maintient connecté et mémorise vos préférences pendant votre visite.',
      },
      defaultEnabled: true,
    },
  ],
};

/** Defaults applied to any user-supplied `CookieConsentConfig`. User values always win. */
export const DEFAULT_CONFIG: Partial<CookieConsentConfig> = {
  defaultLanguage: 'en',
  availableLanguages: ['en'],
  customLanguages: {},
  showBadgeOpener: true,
  badgePosition: 'left-bottom',
  position: 'bottom-bar',
  theme: 'default',
  cookiePrefix: 'ngrithms_consent_',
  cookieExpiryDays: 365,
  showCookieDetails: true,
  hideDeny: false,
  hideImprint: false,
  excludeRoutes: [],
  version: 1,
};
