import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { CookieService } from './cookie.service';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { DEFAULT_ESSENTIAL_CATEGORY, ESSENTIAL_CATEGORY_KEY } from '../tokens/defaults';
import { Category } from '../types/category';
import { ConsentState } from '../types/consent-state';
import { CookieItem } from '../types/cookie-item';

/**
 * Signal-based consent state with imperative controls.
 *
 * - `state()` is `null` until the user has decided.
 * - `isGranted(itemKey)` is a reactive per-item check (always `true` for essential items).
 * - State is persisted to a single JSON cookie under `<cookiePrefix>state`.
 * - A mismatch between persisted `version` and `config.version` forces a re-prompt.
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly config = inject(COOKIE_CONSENT_CONFIG);
  private readonly cookies = inject(CookieService);

  private readonly cookieName = `${this.config.cookiePrefix ?? 'ngrithms_consent_'}state`;

  private readonly stateSignal = signal<ConsentState | null>(this.loadPersisted());
  private readonly bannerVisibleSignal = signal<boolean>(this.stateSignal() === null);
  private readonly modalVisibleSignal = signal<boolean>(false);

  /** All categories the consent UI shows, with `essential` prepended. */
  readonly categories: Category[] = this.buildCategories();

  /** Flat list of every `CookieItem.key` across all categories. */
  readonly allItemKeys: string[] = this.categories.flatMap((c) => c.items.map((i) => i.key));

  /** Item keys that belong to the (locked) essential category. */
  readonly essentialItemKeys: string[] = this.categories[0].items.map((i) => i.key);

  /** Current persisted consent state, or `null` if the user has not yet decided. */
  readonly state: Signal<ConsentState | null> = this.stateSignal.asReadonly();
  /** Has the user decided yet? */
  readonly hasDecided: Signal<boolean> = computed(() => this.stateSignal() !== null);
  /** Is the main consent banner showing? */
  readonly bannerVisible: Signal<boolean> = this.bannerVisibleSignal.asReadonly();
  /** Is the detailed customisation modal showing? */
  readonly modalVisible: Signal<boolean> = this.modalVisibleSignal.asReadonly();

  readonly state$: Observable<ConsentState | null> = toObservable(this.stateSignal);

  /** Reactive per-item consent check. Always `true` for essential items. */
  isGranted(itemKey: string): Signal<boolean> {
    return computed(() => this.isItemGranted(itemKey, this.stateSignal()));
  }

  /** Observable per-item consent check, for RxJS-flavoured consumers. */
  item$(itemKey: string): Observable<boolean> {
    return toObservable(this.isGranted(itemKey));
  }

  /** Accept all items in the given list (plus essential implicit). */
  accept(itemKeys: string[]): void {
    const granted: Record<string, boolean> = {};
    for (const key of this.allItemKeys) {
      granted[key] = this.essentialItemKeys.includes(key) || itemKeys.includes(key);
    }
    this.commit(granted);
  }

  /** Accept every item across every category. */
  acceptAll(): void {
    this.accept(this.allItemKeys);
  }

  /** Deny everything except essential items. */
  denyAll(): void {
    this.accept([]);
  }

  /** Re-open the consent banner. */
  open(): void {
    this.bannerVisibleSignal.set(true);
  }

  /** Close the banner without saving. */
  close(): void {
    this.bannerVisibleSignal.set(false);
    this.modalVisibleSignal.set(false);
  }

  /** Toggle the detailed customisation modal. */
  openModal(): void {
    this.modalVisibleSignal.set(true);
  }

  closeModal(): void {
    this.modalVisibleSignal.set(false);
  }

  /** Clear the persisted decision. Useful for testing or "withdraw consent" flows. */
  reset(): void {
    this.cookies.delete(this.cookieName);
    this.stateSignal.set(null);
    this.bannerVisibleSignal.set(true);
    this.modalVisibleSignal.set(false);
  }

  private commit(granted: Record<string, boolean>): void {
    const next: ConsentState = {
      granted,
      timestamp: Date.now(),
      version: this.config.version ?? 1,
    };
    this.cookies.setJSON(this.cookieName, next, this.config.cookieExpiryDays ?? 365);
    this.stateSignal.set(next);
    this.bannerVisibleSignal.set(false);
    this.modalVisibleSignal.set(false);
  }

  private loadPersisted(): ConsentState | null {
    const stored = this.cookies.getJSON<ConsentState>(this.cookieName);
    if (!stored) return null;
    if (stored.version !== (this.config.version ?? 1)) return null;
    return stored;
  }

  private isItemGranted(itemKey: string, state: ConsentState | null): boolean {
    if (this.essentialItemKeys.includes(itemKey)) return true;
    return state?.granted[itemKey] === true;
  }

  private buildCategories(): Category[] {
    const essential = mergeEssential(this.config.essential);
    const userCategories = (this.config.categories ?? []).filter(
      (c) => c.key !== ESSENTIAL_CATEGORY_KEY,
    );
    return [essential, ...userCategories];
  }
}

function mergeEssential(override?: Partial<Category>): Category {
  const items: CookieItem[] = override?.items?.length
    ? override.items
    : DEFAULT_ESSENTIAL_CATEGORY.items;
  return {
    key: ESSENTIAL_CATEGORY_KEY,
    name: override?.name ?? DEFAULT_ESSENTIAL_CATEGORY.name,
    description: override?.description ?? DEFAULT_ESSENTIAL_CATEGORY.description,
    items,
  };
}
