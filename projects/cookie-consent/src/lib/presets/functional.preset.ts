import { Category } from '../types/category';

/** Functional category preset — non-essential features that remember user preferences. */
export const FUNCTIONAL_PRESET: Category = {
  key: 'functional',
  name: { en: 'Functional', fr: 'Fonctionnels' },
  description: {
    en: 'Enables enhanced features and remembers your preferences.',
    fr: 'Active des fonctionnalités améliorées et mémorise vos préférences.',
  },
  items: [
    {
      key: 'preferences',
      name: { en: 'Preferences', fr: 'Préférences' },
      description: {
        en: 'Remembers your language, theme, and other UI preferences across visits.',
        fr: 'Mémorise votre langue, thème et autres préférences d\'interface entre les visites.',
      },
      cookies: [
        { name: 'lang', provider: 'Site', purpose: 'Stores selected language', duration: '1 year' },
        { name: 'theme', provider: 'Site', purpose: 'Stores selected theme', duration: '1 year' },
      ],
    },
    {
      key: 'live_chat',
      name: { en: 'Live Chat', fr: 'Chat en direct' },
      description: {
        en: 'Powers in-page customer support chat.',
        fr: 'Alimente le chat d\'assistance client sur la page.',
      },
      cookies: [
        { name: 'intercom-*', provider: 'Intercom', purpose: 'Identifies returning chat users', duration: '9 months' },
      ],
    },
  ],
};
