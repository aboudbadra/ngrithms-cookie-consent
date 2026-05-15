/**
 * The persisted consent decision. `null` if the user has not yet decided.
 *
 * Stored as a single JSON cookie under `<cookiePrefix>state`.
 */
export interface ConsentState {
  /** Per-item boolean keyed by `CookieItem.key`. Essential items are always `true`. */
  granted: Record<string, boolean>;
  /** Decision timestamp (ms epoch). */
  timestamp: number;
  /**
   * `config.version` at the time of decision — a *prompt* version. Bump to force a
   * re-prompt without changing the storage shape (e.g. you added a new category).
   */
  version: number;
  /**
   * Storage *schema* version — describes the shape of this object and the meaning of
   * `granted` keys. Bump when you rename a `CookieItem.key` or otherwise change how
   * stored data should be interpreted. A mismatch routes the data through `config.migrate`
   * (or discards it if no migrate is configured). Defaults to `1` when omitted (legacy
   * cookies written by 0.1.x).
   */
  schemaVersion?: number;
}
