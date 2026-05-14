import { TranslatableString } from './translatable-string';

/**
 * Informational row describing a single cookie. Rendered in the "details" view of the
 * consent modal. Not a toggle — consent is granted at the `CookieItem` level.
 */
export interface CookieDetail {
  /** Cookie name as it appears in `document.cookie`. e.g. `_ga`. */
  name: string;
  /** Vendor / service that sets this cookie. e.g. `Google`. */
  provider?: string;
  /** Why this cookie exists. */
  purpose?: string | TranslatableString;
  /** How long it persists. e.g. `2 years`. */
  duration?: string | TranslatableString;
}
