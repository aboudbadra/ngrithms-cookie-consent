import { CookieItem } from './cookie-item';
import { TranslatableString } from './translatable-string';

/**
 * A visual grouping of `CookieItem`s. The category itself is not toggleable — its items are.
 * The category's role is to group related items under one heading in the consent UI.
 */
export interface Category {
  /** Stable category key (used internally; NOT used by `*ngrIfConsent`). */
  key: string;
  /** Heading shown above this category's items in the consent UI. */
  name: string | TranslatableString;
  /** Optional intro text shown under the heading. */
  description?: string | TranslatableString;
  /** The items inside this category. Each gets its own checkbox. */
  items: CookieItem[];
}
