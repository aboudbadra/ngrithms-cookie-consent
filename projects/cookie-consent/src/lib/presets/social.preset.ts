import { Category } from '../types/category';

/** Social category preset — third-party embeds (videos, social posts) that set their own cookies. */
export const SOCIAL_PRESET: Category = {
  key: 'social',
  name: { en: 'Social Media', fr: 'Réseaux sociaux' },
  description: {
    en: 'Required for embedded videos, posts, and share buttons to work.',
    fr: 'Nécessaire au fonctionnement des vidéos intégrées, publications et boutons de partage.',
  },
  items: [
    {
      key: 'youtube',
      name: 'YouTube',
      description: {
        en: 'Lets us embed YouTube videos. Loads cookies set by Google.',
        fr: 'Permet d\'intégrer des vidéos YouTube. Charge des cookies définis par Google.',
      },
      privacyPolicyUrl: 'https://policies.google.com/privacy',
      cookies: [
        { name: 'VISITOR_INFO1_LIVE', provider: 'YouTube', purpose: 'Bandwidth estimation', duration: '6 months' },
        { name: 'YSC', provider: 'YouTube', purpose: 'Tracks video views', duration: 'Session' },
      ],
    },
    {
      key: 'twitter',
      name: 'X (Twitter)',
      description: {
        en: 'Lets us embed X / Twitter posts.',
        fr: 'Permet d\'intégrer des publications X / Twitter.',
      },
      privacyPolicyUrl: 'https://x.com/privacy',
      cookies: [
        { name: 'guest_id', provider: 'X', purpose: 'Guest user identifier', duration: '2 years' },
      ],
    },
    {
      key: 'vimeo',
      name: 'Vimeo',
      description: {
        en: 'Lets us embed Vimeo videos.',
        fr: 'Permet d\'intégrer des vidéos Vimeo.',
      },
      privacyPolicyUrl: 'https://vimeo.com/privacy',
      cookies: [
        { name: 'vuid', provider: 'Vimeo', purpose: 'Tracks video views and preferences', duration: '2 years' },
      ],
    },
  ],
};
