import { Category } from './category';
import { LanguagePack } from './language-pack';
import { TranslatableString } from './translatable-string';

/** Where on the screen the consent banner/modal appears. */
export type ConsentPosition =
  | 'bottom-bar'
  | 'top-bar'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right'
  | 'modal';

/** Where the floating re-open badge sits. */
export type BadgePosition = 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';

/** Theme preset name, or `'none'` for headless (ship no CSS). */
export type ThemeName = 'default' | 'dark' | 'minimal' | 'rounded' | 'none';

/**
 * Full configuration for `provideCookieConsent({...})`.
 *
 * Only `categories` is required — every other field has a sensible default.
 */
export interface CookieConsentConfig {
  /** Privacy policy URL. Linked in the banner footer. */
  privacyPolicyUrl?: string | TranslatableString;
  /** Imprint / legal notice URL. Linked in the banner footer. */
  imprintUrl?: string | TranslatableString;

  /** Default language code. Default: `'en'`. */
  defaultLanguage?: string;
  /** Available language codes the switcher offers. Default: `['en']`. */
  availableLanguages?: string[];
  /** Show the language switcher in the consent UI. Default: `true` if >1 language, else `false`. */
  showLanguageSwitcher?: boolean;
  /** BYO translations. Matches upstream v2.3+ `CustomLanguageConfig`. */
  customLanguages?: Record<string, LanguagePack>;

  /** Show a floating button users can click to re-open the consent UI. Default: `true`. */
  showBadgeOpener?: boolean;
  /** Which corner the badge sits in. Default: `'left-bottom'`. */
  badgePosition?: BadgePosition;
  /** Class applied to the badge for BYO styling. */
  customOpenerClass?: string;

  /** Banner / modal position. Default: `'bottom-bar'`. */
  position?: ConsentPosition;
  /** Theme preset name, or `'none'` for headless. Default: `'default'`. */
  theme?: ThemeName;
  /** Class applied to the banner/modal root for BYO styling. */
  customClass?: string;

  /** Cookie name prefix for persisted state. Default: `'ngrithms_consent_'`. */
  cookiePrefix?: string;
  /** How long the consent decision persists, in days. Default: `365`. */
  cookieExpiryDays?: number;

  /** Show the "View details" toggle in the consent modal. Default: `true`. */
  showCookieDetails?: boolean;
  /** Hide the "Deny" button (only "Accept all" / "Customise" remain). Default: `false`. */
  hideDeny?: boolean;
  /** Hide the imprint link in the footer. Default: `false`. */
  hideImprint?: boolean;

  /** Routes on which the banner should never appear (e.g. `['/privacy-policy']`). */
  excludeRoutes?: string[];

  /** User-defined consent categories. Required. */
  categories: Category[];
  /** Optional override of the implicit `essential` category (label, description, items). */
  essential?: Partial<Category>;

  /**
   * Bump to force a re-prompt of users who have already decided.
   * Use when you add a new category or substantially change cookie usage.
   * Default: `1`.
   */
  version?: number;

  /**
   * Storage schema version. Bump when you **rename a `CookieItem.key`** or otherwise
   * change how persisted state should be interpreted. Different from `version`, which
   * forces a re-prompt without changing the storage shape. Default: `1`.
   *
   * On read, a stored state whose `schemaVersion` doesn't match this value is routed
   * through `migrate` (if configured); otherwise it's discarded and the user is
   * re-prompted.
   */
  schemaVersion?: number;

  /**
   * Optional migration hook. Called when persisted state's `schemaVersion` doesn't
   * match `config.schemaVersion`. Receives the raw stored object and must return either
   * a valid `ConsentState` (which will be adopted) or `null` (which discards the data
   * and re-prompts the user).
   *
   * @example
   * migrate: (stored) => {
   *   const old = stored as { granted: Record<string, boolean> };
   *   // v1 used "ga", v2 uses "google_analytics"
   *   const granted = { ...old.granted, google_analytics: old.granted['ga'] === true };
   *   delete granted['ga'];
   *   return { granted, timestamp: Date.now(), version: 1, schemaVersion: 2 };
   * }
   */
  migrate?: (stored: unknown) => import('./consent-state').ConsentState | null;
}
