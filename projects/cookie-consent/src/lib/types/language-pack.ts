/**
 * A user-supplied translation pack. Provide via `CookieConsentConfig.customLanguages`.
 *
 * @example
 * customLanguages: {
 *   sw: {
 *     languageKey: 'sw',
 *     languageName: 'Kiswahili',
 *     iconPath: '/assets/flags/sw.svg',
 *     translations: { 'banner.title': 'Tunatumia vidakuzi', ... },
 *     fallback: 'en',
 *   },
 * }
 */
export interface LanguagePack {
  /** Short language code. Used in `availableLanguages` and `defaultLanguage`. */
  languageKey: string;
  /** Human-readable name shown in the language switcher. */
  languageName: string;
  /** Optional path/URL to a flag icon. */
  iconPath?: string;
  /** Flat key → translated string map. Keys must match the built-in translation keys. */
  translations: Record<string, string>;
  /** Language code to fall back to for missing keys. Default: `'en'`. */
  fallback?: string;
}
