import { Category } from '../types/category';

/** Marketing category preset — tag managers and conversion-tracking pixels. */
export const MARKETING_PRESET: Category = {
  key: 'marketing',
  name: { en: 'Marketing', fr: 'Marketing' },
  description: {
    en: 'Used to measure campaign effectiveness and personalise your experience.',
    fr: 'Utilisé pour mesurer l\'efficacité des campagnes et personnaliser votre expérience.',
  },
  items: [
    {
      key: 'google_tag_manager',
      name: 'Google Tag Manager',
      description: {
        en: 'Container for marketing and analytics tags.',
        fr: 'Conteneur pour les balises marketing et analytiques.',
      },
      privacyPolicyUrl: 'https://policies.google.com/privacy',
      cookies: [
        { name: '_gcl_au', provider: 'Google', purpose: 'Stores conversion attribution', duration: '90 days' },
      ],
    },
    {
      key: 'meta_pixel',
      name: 'Meta Pixel',
      description: {
        en: 'Facebook / Instagram conversion tracking and ad audiences.',
        fr: 'Suivi des conversions Facebook / Instagram et audiences publicitaires.',
      },
      privacyPolicyUrl: 'https://www.facebook.com/policy.php',
      cookies: [
        { name: '_fbp', provider: 'Meta', purpose: 'Distinguishes unique users for ad delivery', duration: '90 days' },
      ],
    },
    {
      key: 'linkedin_insight',
      name: 'LinkedIn Insight',
      description: {
        en: 'LinkedIn conversion tracking and retargeting.',
        fr: 'Suivi des conversions et reciblage LinkedIn.',
      },
      privacyPolicyUrl: 'https://www.linkedin.com/legal/privacy-policy',
      cookies: [
        { name: 'li_sugr', provider: 'LinkedIn', purpose: 'Browser identifier for ad targeting', duration: '90 days' },
      ],
    },
  ],
};
