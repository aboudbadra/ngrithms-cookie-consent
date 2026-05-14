import { InjectionToken } from '@angular/core';
import { CookieConsentConfig } from '../types/config';

/**
 * Resolved (defaults-merged) configuration. Provided by `provideCookieConsent({...})`.
 * Inject this if you need raw config access — most users should use `ConsentService` instead.
 */
export const COOKIE_CONSENT_CONFIG = new InjectionToken<CookieConsentConfig>('COOKIE_CONSENT_CONFIG');
