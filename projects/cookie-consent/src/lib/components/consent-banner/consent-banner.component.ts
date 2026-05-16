import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ConsentModalComponent } from '../consent-modal/consent-modal.component';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { ConsentService } from '../../services/consent.service';
import { LanguageService } from '../../services/language.service';

/**
 * Main consent banner. Place at the root of your app — visibility is automatic.
 *
 * @example <ngr-consent-banner></ngr-consent-banner>
 */
@Component({
  selector: 'ngr-consent-banner',
  standalone: true,
  imports: [ConsentModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './consent-banner.component.html',
  styleUrl: './consent-banner.component.scss',
})
export class ConsentBannerComponent {
  protected readonly config = inject(COOKIE_CONSENT_CONFIG);
  protected readonly consent = inject(ConsentService);
  protected readonly i18n = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly title = this.i18n.translate('banner.title');
  protected readonly description = this.i18n.translate('banner.description');
  protected readonly acceptAllLabel = this.i18n.translate('banner.accept_all');
  protected readonly denyAllLabel = this.i18n.translate('banner.deny_all');
  protected readonly customizeLabel = this.i18n.translate('banner.customize');
  protected readonly privacyPolicyLabel = this.i18n.translate('footer.privacy_policy');
  protected readonly imprintLabel = this.i18n.translate('footer.imprint');
  protected readonly languageSwitcherLabel = this.i18n.translate('a11y.language_switcher');

  protected readonly privacyPolicyUrl = this.i18n.resolve(this.config.privacyPolicyUrl);
  protected readonly imprintUrl = this.i18n.resolve(this.config.imprintUrl);

  protected readonly visible = computed(
    () => this.consent.bannerVisible() && !this.consent.modalVisible(),
  );

  protected readonly languages = this.i18n.availableLanguages;
  protected readonly currentLanguage = this.i18n.currentLanguage;

  protected acceptAll(): void {
    this.consent.acceptAll();
  }

  protected denyAll(): void {
    this.consent.denyAll();
  }

  protected customize(): void {
    this.consent.openModal();
  }

  protected setLanguage(code: string): void {
    this.i18n.setLanguage(code);
  }

  protected getLanguagePack(code: string) {
    return this.i18n.getPack(code);
  }

  private triggerElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (!this.isBrowser) return;
      if (isVisible) {
        this.handleOpen();
      } else {
        this.handleClose();
      }
    });
  }

  private handleOpen(): void {
    // Only manage focus when an interactive element triggered the open
    // (e.g. the floating badge or a host-app "Show preferences" link).
    // On initial page load activeElement is body/html — leave the user alone.
    const active = this.document.activeElement;
    const triggered =
      active instanceof HTMLElement &&
      active !== this.document.body &&
      active !== this.document.documentElement;
    if (!triggered) {
      this.triggerElement = null;
      return;
    }
    this.triggerElement = active;
    queueMicrotask(() => this.moveFocusIntoBanner());
  }

  private handleClose(): void {
    // If the modal is taking over, let the modal's focus management run.
    if (this.consent.modalVisible()) {
      // Modal will capture the current activeElement (the Customize button)
      // as its own trigger and restore focus there on close.
      this.triggerElement = null;
      return;
    }
    const trigger = this.triggerElement;
    this.triggerElement = null;
    if (!trigger) return;
    queueMicrotask(() => {
      if (this.document.body.contains(trigger)) {
        trigger.focus();
        return;
      }
      // Trigger removed from DOM (e.g. badge re-renders after decision).
      // Fall back to the badge if it's now visible.
      this.document.querySelector<HTMLElement>('.ngr-consent-badge')?.focus();
    });
  }

  private moveFocusIntoBanner(): void {
    const bannerEl = this.document.querySelector<HTMLElement>('.ngr-consent-banner');
    if (!bannerEl) return;
    // Skip the language switcher; the action buttons are the point of the banner.
    const firstButton = bannerEl.querySelector<HTMLElement>('.ngr-consent-banner__btn');
    (firstButton ?? bannerEl).focus();
  }
}
