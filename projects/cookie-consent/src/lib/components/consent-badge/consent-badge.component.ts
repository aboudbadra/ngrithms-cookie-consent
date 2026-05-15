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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120.23 122.88"
          width="22"
          height="22"
          aria-hidden="true"
        >
          <path
            fill="var(--ngrithms-badge-icon-fill, currentColor)"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M98.18,0c3.3,0,5.98,2.68,5.98,5.98c0,3.3-2.68,5.98-5.98,5.98c-3.3,0-5.98-2.68-5.98-5.98C92.21,2.68,94.88,0,98.18,0L98.18,0z M99.78,52.08c5.16,7.7,11.69,10.06,20.17,4.85c0.28,2.9,0.35,5.86,0.2,8.86c-1.67,33.16-29.9,58.69-63.06,57.02C23.94,121.13-1.59,92.9,0.08,59.75C1.74,26.59,30.95,0.78,64.1,2.45c-2.94,9.2-0.45,17.37,7.03,20.15C64.35,44.38,79.49,58.63,99.78,52.08L99.78,52.08z M30.03,47.79c4.97,0,8.99,4.03,8.99,8.99s-4.03,8.99-8.99,8.99c-4.97,0-8.99-4.03-8.99-8.99S25.07,47.79,30.03,47.79L30.03,47.79z M58.35,59.25c2.86,0,5.18,2.32,5.18,5.18c0,2.86-2.32,5.18-5.18,5.18c-2.86,0-5.18-2.32-5.18-5.18C53.16,61.57,55.48,59.25,58.35,59.25L58.35,59.25z M35.87,80.59c3.49,0,6.32,2.83,6.32,6.32c0,3.49-2.83,6.32-6.32,6.32c-3.49,0-6.32-2.83-6.32-6.32C29.55,83.41,32.38,80.59,35.87,80.59L35.87,80.59z M49.49,32.23c2.74,0,4.95,2.22,4.95,4.95c0,2.74-2.22,4.95-4.95,4.95c-2.74,0-4.95-2.22-4.95-4.95C44.54,34.45,46.76,32.23,49.49,32.23L49.49,32.23z M76.39,82.8c4.59,0,8.3,3.72,8.3,8.3c0,4.59-3.72,8.3-8.3,8.3c-4.59,0-8.3-3.72-8.3-8.3C68.09,86.52,71.81,82.8,76.39,82.8L76.39,82.8z M93.87,23.1c3.08,0,5.58,2.5,5.58,5.58c0,3.08-2.5,5.58-5.58,5.58s-5.58-2.5-5.58-5.58C88.29,25.6,90.79,23.1,93.87,23.1L93.87,23.1z"
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
