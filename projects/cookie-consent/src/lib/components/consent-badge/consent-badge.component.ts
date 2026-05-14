import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { ConsentService } from '../../services/consent.service';
import { LanguageService } from '../../services/language.service';

/**
 * Floating re-open button. Place at the root of your app — visibility is automatic.
 *
 * @example <ngr-consent-badge></ngr-consent-badge>
 */
@Component({
  selector: 'ngr-consent-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <button
        type="button"
        class="ngr-consent-badge"
        [class]="config.customOpenerClass"
        [attr.data-position]="config.badgePosition"
        [attr.aria-label]="openLabel()"
        (click)="open()"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-.55-.04-1.09-.13-1.61-.36.12-.74.18-1.12.18-1.93 0-3.5-1.57-3.5-3.5 0-.7.21-1.34.56-1.89C16.13 4.39 14.16 3.5 12 3.5 7.86 3.5 4.5 6.86 4.5 11s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5c0-.17-.01-.34-.02-.5.31.16.66.25 1.02.25h.13C20.96 13.41 22 12.83 22 12c0-5.52-4.48-10-10-10zm-4 9a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 8 11zm2 5a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 10 16zm4-1.5a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 14 14.5z"
          />
        </svg>
      </button>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .ngr-consent-badge {
        position: fixed;
        z-index: var(--ngrithms-z-badge, 9998);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--ngrithms-badge-size, 44px);
        height: var(--ngrithms-badge-size, 44px);
        padding: 0;
        background: var(--ngrithms-badge-bg, #ffffff);
        color: var(--ngrithms-badge-fg, #1f2937);
        border: 1px solid var(--ngrithms-badge-border, rgba(0, 0, 0, 0.08));
        border-radius: var(--ngrithms-badge-radius, 999px);
        box-shadow: var(--ngrithms-badge-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .ngr-consent-badge:hover {
        transform: translateY(-1px);
      }
      .ngr-consent-badge[data-position='left-bottom'] {
        left: var(--ngrithms-badge-offset, 16px);
        bottom: var(--ngrithms-badge-offset, 16px);
      }
      .ngr-consent-badge[data-position='right-bottom'] {
        right: var(--ngrithms-badge-offset, 16px);
        bottom: var(--ngrithms-badge-offset, 16px);
      }
      .ngr-consent-badge[data-position='left-top'] {
        left: var(--ngrithms-badge-offset, 16px);
        top: var(--ngrithms-badge-offset, 16px);
      }
      .ngr-consent-badge[data-position='right-top'] {
        right: var(--ngrithms-badge-offset, 16px);
        top: var(--ngrithms-badge-offset, 16px);
      }
    `,
  ],
})
export class ConsentBadgeComponent {
  readonly config = inject(COOKIE_CONSENT_CONFIG);
  private readonly consent = inject(ConsentService);
  private readonly i18n = inject(LanguageService);

  readonly openLabel = this.i18n.translate('badge.open');

  /** Visible only when (a) user has decided AND (b) showBadgeOpener is true AND (c) banner is closed. */
  readonly visible = computed(
    () =>
      (this.config.showBadgeOpener ?? true) &&
      this.consent.hasDecided() &&
      !this.consent.bannerVisible(),
  );

  open(): void {
    this.consent.open();
  }
}
