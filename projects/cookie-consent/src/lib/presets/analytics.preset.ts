import { Category } from '../types/category';

/**
 * Analytics category preset — measurement / product analytics services.
 * Spread into `provideCookieConsent({ categories: [ANALYTICS_PRESET, ...] })`,
 * or use as a template: `{ ...ANALYTICS_PRESET, items: [...ANALYTICS_PRESET.items, myCustomItem] }`.
 */
export const ANALYTICS_PRESET: Category = {
  key: 'analytics',
  name: { en: 'Analytics', fr: 'Statistiques' },
  description: {
    en: 'Helps us understand how visitors interact with the site.',
    fr: 'Nous aide à comprendre comment les visiteurs interagissent avec le site.',
  },
  items: [
    {
      key: 'google_analytics',
      name: 'Google Analytics',
      description: {
        en: 'Web analytics service by Google. Tracks page views, sessions, and user behaviour.',
        fr: 'Service d\'analyse web de Google. Suit les pages vues, les sessions et le comportement.',
      },
      privacyPolicyUrl: 'https://policies.google.com/privacy',
      cookies: [
        { name: '_ga', provider: 'Google', purpose: 'Distinguishes unique users', duration: '2 years' },
        { name: '_gid', provider: 'Google', purpose: 'Distinguishes unique users', duration: '24 hours' },
        { name: '_gat', provider: 'Google', purpose: 'Throttles request rate', duration: '1 minute' },
      ],
    },
    {
      key: 'hotjar',
      name: 'Hotjar',
      description: {
        en: 'Session recordings, heatmaps, and feedback polls.',
        fr: 'Enregistrements de session, cartes de chaleur et sondages de retour.',
      },
      privacyPolicyUrl: 'https://www.hotjar.com/legal/policies/privacy/',
      cookies: [
        { name: '_hjid', provider: 'Hotjar', purpose: 'User session identifier', duration: '1 year' },
        { name: '_hjSessionUser_*', provider: 'Hotjar', purpose: 'User identifier across sessions', duration: '1 year' },
      ],
    },
    {
      key: 'mixpanel',
      name: 'Mixpanel',
      description: {
        en: 'Product analytics for tracking user actions and funnels.',
        fr: 'Analyse produit pour suivre les actions utilisateur et les entonnoirs.',
      },
      privacyPolicyUrl: 'https://mixpanel.com/legal/privacy-policy/',
      cookies: [
        { name: 'mp_*', provider: 'Mixpanel', purpose: 'Distinguishes unique users', duration: '1 year' },
      ],
    },
  ],
};
