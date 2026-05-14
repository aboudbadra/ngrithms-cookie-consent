/**
 * A string keyed by language code. Resolved at runtime against the active language,
 * falling back to the configured default language if a key is missing.
 *
 * @example
 * { en: 'Accept all', fr: 'Tout accepter', de: 'Alle akzeptieren' }
 */
export type TranslatableString = Record<string, string>;
