import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { ConsentService } from '../../services/consent.service';
import { LanguageService } from '../../services/language.service';
import { CookieDetail } from '../../types/cookie-detail';
import { TranslatableString } from '../../types/translatable-string';

/**
 * Detailed customisation modal. Embedded inside `<ngxt-consent-banner>` and opened via
 * the "Customise" button — you don't normally need to place this directly.
 */
@Component({
  selector: 'ngxt-consent-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consent-modal.component.html',
  styleUrl: './consent-modal.component.scss',
})
export class ConsentModalComponent {
  protected readonly config = inject(COOKIE_CONSENT_CONFIG);
  protected readonly consent = inject(ConsentService);
  protected readonly i18n = inject(LanguageService);

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

  /** Per-item draft state. Hydrated from current consent (or item defaults if none). */
  protected readonly selected = signal<Record<string, boolean>>({});
  /** Per-item "details expanded" toggle. */
  protected readonly expandedDetails = signal<Record<string, boolean>>({});

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.hydrateDraft();
      }
    });
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
