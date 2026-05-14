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
  /** `config.version` at the time of decision. A mismatch forces a re-prompt. */
  version: number;
}
