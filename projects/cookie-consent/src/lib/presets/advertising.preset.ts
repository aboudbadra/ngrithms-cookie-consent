import { Category } from '../types/category';

/** Advertising category preset — ad networks and retargeting platforms. */
export const ADVERTISING_PRESET: Category = {
  key: 'advertising',
  name: { en: 'Advertising', fr: 'Publicité' },
  description: {
    en: 'Used to show you relevant ads and measure ad performance.',
    fr: 'Utilisé pour afficher des publicités pertinentes et mesurer leur performance.',
  },
  items: [
    {
      key: 'google_ads',
      name: 'Google Ads',
      description: {
        en: 'Conversion tracking and remarketing for Google Ads campaigns.',
        fr: 'Suivi des conversions et remarketing pour les campagnes Google Ads.',
      },
      privacyPolicyUrl: 'https://policies.google.com/privacy',
      cookies: [
        { name: 'IDE', provider: 'DoubleClick', purpose: 'Ad targeting and measurement', duration: '13 months' },
        { name: '_gcl_aw', provider: 'Google', purpose: 'Stores ad click attribution', duration: '90 days' },
      ],
    },
    {
      key: 'microsoft_ads',
      name: 'Microsoft Advertising',
      description: {
        en: 'Conversion tracking for Microsoft / Bing Ads.',
        fr: 'Suivi des conversions pour Microsoft / Bing Ads.',
      },
      privacyPolicyUrl: 'https://privacy.microsoft.com/privacystatement',
      cookies: [
        { name: 'MUID', provider: 'Microsoft', purpose: 'Cross-site user identifier', duration: '13 months' },
      ],
    },
  ],
};
