import { ConsentService } from '../services/consent.service';
import { ConsentState } from '../types/consent-state';

/**
 * Google Consent Mode v2 consent type. See
 * https://developers.google.com/tag-platform/security/guidance/consent-mode
 */
export type GoogleConsentType =
  | 'ad_storage'
  | 'ad_user_data'
  | 'ad_personalization'
  | 'analytics_storage'
  | 'functionality_storage'
  | 'personalization_storage'
  | 'security_storage';

/**
 * Maps `CookieItem.key` → one or more Google consent types.
 *
 * @example
 * {
 *   google_analytics: 'analytics_storage',
 *   google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
 * }
 */
export type GoogleConsentMapping = Record<string, GoogleConsentType | GoogleConsentType[]>;

/** The object passed to `gtag('consent', 'update', ...)`. */
export type GoogleConsentObject = Partial<Record<GoogleConsentType, 'granted' | 'denied'>>;

export interface ApplyGoogleConsentModeOptions {
  mapping: GoogleConsentMapping;
  /** Optional defaults applied via `gtag('consent', 'default', ...)` on first call. */
  defaults?: GoogleConsentObject;
  /**
   * Custom `gtag` function. Defaults to `window.gtag`. Useful for testing or if your
   * tag manager exposes gtag under a different name.
   */
  gtag?: (...args: unknown[]) => void;
}

/**
 * Convert a `ConsentState` into a Google Consent Mode v2 object using the provided mapping.
 * Items missing from the state are treated as `'denied'`.
 */
export function consentToGoogleConsentObject(
  state: ConsentState | null,
  mapping: GoogleConsentMapping,
): GoogleConsentObject {
  const result: GoogleConsentObject = {};
  const granted = state?.granted ?? {};
  for (const [itemKey, target] of Object.entries(mapping)) {
    const isGranted = granted[itemKey] === true;
    const value = isGranted ? 'granted' : 'denied';
    const targets = Array.isArray(target) ? target : [target];
    for (const t of targets) {
      result[t] = value;
    }
  }
  return result;
}

/**
 * Subscribes a `ConsentService` to Google Consent Mode v2. Calls
 * `gtag('consent', 'default', ...)` once with the supplied defaults, then
 * `gtag('consent', 'update', ...)` whenever consent changes.
 *
 * Returns an unsubscribe function — call it on teardown if you need to stop forwarding.
 *
 * @example
 * applyGoogleConsentMode(consent, {
 *   mapping: {
 *     google_analytics: 'analytics_storage',
 *     google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
 *   },
 *   defaults: { analytics_storage: 'denied', ad_storage: 'denied' },
 * });
 */
export function applyGoogleConsentMode(
  consent: ConsentService,
  options: ApplyGoogleConsentModeOptions,
): () => void {
  const gtag = options.gtag ?? getGlobalGtag();
  if (!gtag) {
    // No-op on the server or in environments without gtag.
    return () => undefined;
  }

  if (options.defaults) {
    gtag('consent', 'default', options.defaults);
  }

  const subscription = consent.state$.subscribe((state) => {
    const update = consentToGoogleConsentObject(state, options.mapping);
    gtag('consent', 'update', update);
  });

  return () => subscription.unsubscribe();
}

function getGlobalGtag(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
}
