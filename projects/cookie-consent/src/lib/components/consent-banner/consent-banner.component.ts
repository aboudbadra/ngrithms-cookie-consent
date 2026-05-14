import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ConsentModalComponent } from '../consent-modal/consent-modal.component';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { ConsentService } from '../../services/consent.service';
import { LanguageService } from '../../services/language.service';

/**
 * Main consent banner. Place at the root of your app — visibility is automatic.
 *
 * @example <ngxt-consent-banner></ngxt-consent-banner>
 */
@Component({
  selector: 'ngxt-consent-banner',
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
}
