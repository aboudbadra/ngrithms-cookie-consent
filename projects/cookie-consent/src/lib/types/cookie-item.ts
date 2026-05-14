import { CookieDetail } from './cookie-detail';
import { TranslatableString } from './translatable-string';

/**
 * The toggleable unit of consent. Each `CookieItem` gets its own checkbox in the consent
 * UI, and its `key` is what `*ngxIfConsent` and `ConsentService.isGranted(...)` check.
 *
 * @example
 * {
 *   key: 'google_analytics',
 *   name: 'Google Analytics',
 *   description: 'Web analytics by Google.',
 *   privacyPolicyUrl: 'https://policies.google.com/privacy',
 *   cookies: [
 *     { name: '_ga', provider: 'Google', purpose: 'Distinguishes users', duration: '2 years' },
 *   ],
 * }
 */
export interface CookieItem {
  /** Stable key. Used in `ConsentState.granted` and `*ngxIfConsent="'<key>'"`. */
  key: string;
  /** Human-readable label shown in the consent UI. */
  name: string | TranslatableString;
  /** Description shown under the label. */
  description: string | TranslatableString;
  /** Default on/off when the user has not yet decided. Default: `false`. */
  defaultEnabled?: boolean;
  /** Vendor-specific privacy policy URL (overrides the global one for this item). */
  privacyPolicyUrl?: string | TranslatableString;
  /** Informational rows shown in the modal's "details" view. */
  cookies?: CookieDetail[];
}
