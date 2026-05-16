import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { ConsentService } from '../../services/consent.service';
import { LanguageService } from '../../services/language.service';
import { CookieDetail } from '../../types/cookie-detail';
import { TranslatableString } from '../../types/translatable-string';

/**
 * Detailed customisation modal. Embedded inside `<ngr-consent-banner>` and opened via
 * the "Customise" button — you don't normally need to place this directly.
 */
@Component({
  selector: 'ngr-consent-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consent-modal.component.html',
  styleUrl: './consent-modal.component.scss',
})
export class ConsentModalComponent {
  protected readonly config = inject(COOKIE_CONSENT_CONFIG);
  protected readonly consent = inject(ConsentService);
  protected readonly i18n = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly title = this.i18n.translate('banner.title');
  protected readonly description = this.i18n.translate('banner.description');
  protected readonly acceptAllLabel = this.i18n.translate('banner.accept_all');
  protected readonly denyAllLabel = this.i18n.translate('banner.deny_all');
  protected readonly savePreferencesLabel = this.i18n.translate('banner.save_preferences');
  protected readonly showDetailsLabel = this.i18n.translate('banner.show_details');
  protected readonly hideDetailsLabel = this.i18n.translate('banner.hide_details');
  protected readonly lockedLabel = this.i18n.translate('modal.locked');
  protected readonly closeLabel = this.i18n.translate('a11y.close');
  protected readonly colNameLabel = this.i18n.translate('modal.cookie.name');
  protected readonly colProviderLabel = this.i18n.translate('modal.cookie.provider');
  protected readonly colPurposeLabel = this.i18n.translate('modal.cookie.purpose');
  protected readonly colDurationLabel = this.i18n.translate('modal.cookie.duration');

  protected readonly visible = this.consent.modalVisible;
  protected readonly categories = this.consent.categories;
  protected readonly essentialItemKeys = this.consent.essentialItemKeys;

  protected readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');

  /** Per-item draft state. Hydrated from current consent (or item defaults if none). */
  protected readonly selected = signal<Record<string, boolean>>({});
  /** Per-item "details expanded" toggle. */
  protected readonly expandedDetails = signal<Record<string, boolean>>({});

  private triggerElement: HTMLElement | null = null;
  private inertedSiblings: HTMLElement[] = [];
  private hasBeenVisible = false;

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.hasBeenVisible = true;
        this.hydrateDraft();
        if (this.isBrowser) {
          this.captureTrigger();
          queueMicrotask(() => {
            this.applyInert();
            this.moveFocusIntoDialog();
          });
        }
      } else if (this.isBrowser && this.hasBeenVisible) {
        // Only run close-side logic if we've actually been opened. Otherwise
        // the effect's initial run on construction would steal focus to the
        // fallback (badge) on page load, before the user ever touched anything.
        this.releaseInert();
        queueMicrotask(() => this.restoreTriggerFocus());
      }
    });
  }

  protected itemDescriptionId(key: string): string {
    return `ngr-consent-item-desc-${key}`;
  }

  protected detailsTableId(key: string): string {
    return `ngr-consent-item-details-${key}`;
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.visible()) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'Tab') {
      this.trapTab(event);
    }
  }

  private trapTab(event: KeyboardEvent): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    const focusables = this.focusableWithin(dialog);
    if (focusables.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    // Manage every Tab press manually so the dialog's tab order is identical
    // across browsers — Safari with "Keyboard navigation" off otherwise skips
    // buttons/links entirely and routes Tab out to the URL bar.
    event.preventDefault();

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.document.activeElement as HTMLElement | null;
    const idx = active ? focusables.indexOf(active) : -1;

    let next: HTMLElement;
    if (event.shiftKey) {
      next = idx <= 0 ? last : focusables[idx - 1];
    } else {
      next = idx === -1 || idx === focusables.length - 1 ? first : focusables[idx + 1];
    }
    next.focus();
  }

  private focusableWithin(root: HTMLElement): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
      ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute('inert') && el.offsetParent !== null,
    );
  }

  private captureTrigger(): void {
    const active = this.document.activeElement;
    this.triggerElement =
      active && active !== this.document.body ? (active as HTMLElement) : null;
  }

  private moveFocusIntoDialog(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    const focusables = this.focusableWithin(dialog);
    (focusables[0] ?? dialog).focus();
  }

  private restoreTriggerFocus(): void {
    const trigger = this.triggerElement;
    this.triggerElement = null;
    if (trigger && this.document.body.contains(trigger)) {
      trigger.focus();
      return;
    }
    const fallback = this.document.querySelector<HTMLElement>(
      '.ngr-consent-banner__btn--ghost, .ngr-consent-badge',
    );
    fallback?.focus();
  }

  private applyInert(): void {
    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) return;
    const body = this.document.body;
    this.inertedSiblings = Array.from(body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.contains(dialog) && !el.hasAttribute('inert'),
    );
    for (const el of this.inertedSiblings) {
      el.setAttribute('inert', '');
    }
  }

  private releaseInert(): void {
    for (const el of this.inertedSiblings) {
      el.removeAttribute('inert');
    }
    this.inertedSiblings = [];
  }

  protected isItemSelected(key: string): boolean {
    if (this.essentialItemKeys.includes(key)) return true;
    return this.selected()[key] === true;
  }

  protected toggleItem(key: string): void {
    if (this.essentialItemKeys.includes(key)) return;
    const next = { ...this.selected() };
    next[key] = !next[key];
    this.selected.set(next);
  }

  protected isDetailsExpanded(itemKey: string): boolean {
    return this.expandedDetails()[itemKey] === true;
  }

  protected toggleDetails(itemKey: string): void {
    const next = { ...this.expandedDetails() };
    next[itemKey] = !next[itemKey];
    this.expandedDetails.set(next);
  }

  protected acceptAll(): void {
    this.consent.acceptAll();
  }

  protected denyAll(): void {
    this.consent.denyAll();
  }

  protected save(): void {
    const granted = this.selected();
    const accepted = Object.entries(granted)
      .filter(([, on]) => on)
      .map(([key]) => key);
    this.consent.accept(accepted);
  }

  protected close(): void {
    this.consent.closeModal();
  }

  /** Resolve a possibly-translatable string via the active language. */
  protected resolve(value: string | TranslatableString | undefined): string {
    return this.i18n.resolveNow(value);
  }

  protected trackByKey<T extends { key: string }>(_index: number, item: T): string {
    return item.key;
  }

  protected trackByCookieName(_index: number, detail: CookieDetail): string {
    return detail.name;
  }

  private hydrateDraft(): void {
    const state = this.consent.state();
    const draft: Record<string, boolean> = {};
    for (const category of this.categories) {
      for (const item of category.items) {
        if (this.essentialItemKeys.includes(item.key)) {
          draft[item.key] = true;
        } else if (state) {
          draft[item.key] = state.granted[item.key] === true;
        } else {
          draft[item.key] = item.defaultEnabled === true;
        }
      }
    }
    this.selected.set(draft);
  }
}
