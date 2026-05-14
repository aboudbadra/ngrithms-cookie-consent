/*
 * Public API surface of @ngrithms/cookie-consent
 */

// Setup
export { provideCookieConsent } from './lib/providers/provide-cookie-consent';

// Components
export { ConsentBannerComponent } from './lib/components/consent-banner/consent-banner.component';
export { ConsentModalComponent } from './lib/components/consent-modal/consent-modal.component';
export { ConsentBadgeComponent } from './lib/components/consent-badge/consent-badge.component';

// Directive
export { IfConsentDirective } from './lib/directives/if-consent.directive';

// Services
export { ConsentService } from './lib/services/consent.service';
export { LanguageService } from './lib/services/language.service';
export { ScriptLoaderService, type ScriptLoadOptions } from './lib/services/script-loader.service';

// Types
export * from './lib/types';

// Presets
export * from './lib/presets';

// Tokens — for advanced override
export { COOKIE_CONSENT_CONFIG } from './lib/tokens/config.token';
export { ESSENTIAL_CATEGORY_KEY, DEFAULT_ESSENTIAL_CATEGORY } from './lib/tokens/defaults';

// Adapters
export {
  applyGoogleConsentMode,
  consentToGoogleConsentObject,
  type ApplyGoogleConsentModeOptions,
  type GoogleConsentMapping,
  type GoogleConsentObject,
  type GoogleConsentType,
} from './lib/adapters/google-consent-mode';
