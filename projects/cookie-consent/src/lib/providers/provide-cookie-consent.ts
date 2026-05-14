import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { DEFAULT_CONFIG } from '../tokens/defaults';
import { CookieConsentConfig } from '../types/config';

/**
 * Functional setup for `@ngxt/cookie-consent`. Add to the `providers` array of
 * `bootstrapApplication()` (standalone) or your root `NgModule` (classic).
 *
 * @example
 * bootstrapApplication(App, {
 *   providers: [
 *     provideCookieConsent({
 *       privacyPolicyUrl: '/privacy',
 *       categories: [ANALYTICS_PRESET, MARKETING_PRESET],
 *     }),
 *   ],
 * });
 */
export function provideCookieConsent(config: CookieConsentConfig): EnvironmentProviders {
  const resolved = mergeWithDefaults(config);
  return makeEnvironmentProviders([{ provide: COOKIE_CONSENT_CONFIG, useValue: resolved }]);
}

function mergeWithDefaults(user: CookieConsentConfig): CookieConsentConfig {
  const merged: CookieConsentConfig = { ...DEFAULT_CONFIG, ...user } as CookieConsentConfig;

  if (merged.showLanguageSwitcher === undefined) {
    merged.showLanguageSwitcher = (merged.availableLanguages?.length ?? 1) > 1;
  }

  merged.availableLanguages = merged.availableLanguages?.length
    ? merged.availableLanguages
    : ['en'];

  return merged;
}
