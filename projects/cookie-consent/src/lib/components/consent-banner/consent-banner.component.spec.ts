import { describe, expect, it } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConsentBannerComponent } from './consent-banner.component';
import { ConsentService } from '../../services/consent.service';
import { LanguageService } from '../../services/language.service';
import { COOKIE_CONSENT_CONFIG } from '../../tokens/config.token';
import { CookieConsentConfig } from '../../types/config';
import { Category } from '../../types/category';

const ANALYTICS: Category = {
  key: 'analytics',
  name: 'Analytics',
  items: [{ key: 'google_analytics', name: 'GA', description: '' }],
};

function setup(overrides: Partial<CookieConsentConfig> = {}): {
  fixture: ComponentFixture<ConsentBannerComponent>;
  consent: ConsentService;
  i18n: LanguageService;
} {
  const prefix = `test_banner_${Math.random().toString(36).slice(2)}_`;
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: COOKIE_CONSENT_CONFIG,
        useValue: {
          categories: [ANALYTICS],
          cookiePrefix: prefix,
          cookieExpiryDays: 365,
          version: 1,
          defaultLanguage: 'en',
          availableLanguages: ['en'],
          showLanguageSwitcher: false,
          hideDeny: false,
          hideImprint: false,
          position: 'bottom-bar',
          ...overrides,
        } as CookieConsentConfig,
      },
    ],
  });
  const fixture = TestBed.createComponent(ConsentBannerComponent);
  const consent = TestBed.inject(ConsentService);
  const i18n = TestBed.inject(LanguageService);
  fixture.detectChanges();
  return { fixture, consent, i18n };
}

function root(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function bannerRoot(fixture: ComponentFixture<unknown>): HTMLElement | null {
  return root(fixture).querySelector('.ngr-consent-banner');
}

function buttonByText(fixture: ComponentFixture<unknown>, text: string): HTMLButtonElement | null {
  const buttons = Array.from(root(fixture).querySelectorAll('button')) as HTMLButtonElement[];
  return buttons.find((b) => b.textContent?.trim() === text) ?? null;
}

describe('ConsentBannerComponent', () => {
  it('renders on init (no decision yet)', () => {
    const { fixture } = setup();
    expect(bannerRoot(fixture)).not.toBeNull();
  });

  it('exposes role=region and is labelled by its title heading', () => {
    const { fixture } = setup();
    const root = bannerRoot(fixture)!;
    expect(root.getAttribute('role')).toBe('region');
    const labelledBy = root.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('ngr-consent-banner-title');
    const heading = fixture.nativeElement.querySelector(`#${labelledBy}`);
    expect(heading?.textContent?.trim()).toBe('We use cookies');
  });

  it('labels the language switcher via aria-label directly on the select', () => {
    const { fixture } = setup({
      availableLanguages: ['en', 'fr'],
      showLanguageSwitcher: true,
    });
    const select = root(fixture).querySelector(
      '.ngr-consent-banner__lang select',
    ) as HTMLSelectElement;
    expect(select.getAttribute('aria-label')).toBe('Change language');
  });

  it('renders the title and description from the active language', () => {
    const { fixture } = setup();
    expect(root(fixture).textContent).toContain('We use cookies');
  });

  it('clicking "Accept all" commits acceptAll and hides the banner', async () => {
    const { fixture, consent } = setup();
    buttonByText(fixture, 'Accept all')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(consent.hasDecided()).toBe(true);
    expect(consent.isGranted('google_analytics')()).toBe(true);
    expect(bannerRoot(fixture)).toBeNull();
  });

  it('clicking "Reject all" commits denyAll', async () => {
    const { fixture, consent } = setup();
    buttonByText(fixture, 'Reject all')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(consent.hasDecided()).toBe(true);
    expect(consent.isGranted('google_analytics')()).toBe(false);
  });

  it('clicking "Customise" opens the modal and hides the banner section', async () => {
    const { fixture, consent } = setup();
    buttonByText(fixture, 'Customise')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(consent.modalVisible()).toBe(true);
    // visible() is `bannerVisible && !modalVisible` → banner part should be gone.
    expect(bannerRoot(fixture)).toBeNull();
  });

  it('hides the "Reject all" button when hideDeny=true', () => {
    const { fixture } = setup({ hideDeny: true });
    expect(buttonByText(fixture, 'Reject all')).toBeNull();
    expect(buttonByText(fixture, 'Accept all')).not.toBeNull();
  });

  it('renders a language switcher when configured', () => {
    const { fixture } = setup({
      availableLanguages: ['en', 'fr'],
      showLanguageSwitcher: true,
    });
    const select = root(fixture).querySelector(
      '.ngr-consent-banner__lang select',
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    const options = Array.from(select!.querySelectorAll('option')) as HTMLOptionElement[];
    expect(options.map((o) => o.value)).toEqual(['en', 'fr']);
  });

  it('reflects the active language as the selected option (even after a programmatic switch)', async () => {
    const { fixture, i18n } = setup({
      availableLanguages: ['en', 'fr'],
      defaultLanguage: 'en',
      showLanguageSwitcher: true,
    });
    let options = Array.from(
      root(fixture).querySelectorAll('.ngr-consent-banner__lang option'),
    ) as HTMLOptionElement[];
    expect(options.find((o) => o.selected)?.value).toBe('en');

    i18n.setLanguage('fr');
    await fixture.whenStable();
    fixture.detectChanges();
    options = Array.from(
      root(fixture).querySelectorAll('.ngr-consent-banner__lang option'),
    ) as HTMLOptionElement[];
    expect(options.find((o) => o.selected)?.value).toBe('fr');
  });

  it('does not render a language switcher with only one language', () => {
    const { fixture } = setup({
      availableLanguages: ['en'],
      showLanguageSwitcher: true,
    });
    expect(
      root(fixture).querySelector('.ngr-consent-banner__lang select'),
    ).toBeNull();
  });

  it('moves focus to the first action button when re-opened from a triggering element', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open prefs';
    document.body.appendChild(trigger);
    try {
      const { fixture, consent } = setup();
      buttonByText(fixture, 'Accept all')!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(bannerRoot(fixture)).toBeNull();

      trigger.focus();
      consent.open();
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise((r) => queueMicrotask(() => r(null)));

      const customise = buttonByText(fixture, 'Customise')!;
      expect(document.activeElement).toBe(customise);
    } finally {
      trigger.remove();
    }
  });

  it('does not steal focus when the banner appears on initial page load', () => {
    const { fixture } = setup();
    expect(bannerRoot(fixture)).not.toBeNull();
    // activeElement should still be <body> (or whatever it was before setup ran)
    // — definitely not a button inside the banner.
    const inBanner = bannerRoot(fixture)!.contains(document.activeElement);
    expect(inBanner).toBe(false);
  });

  it('switching language updates banner copy reactively', async () => {
    const { fixture, i18n } = setup({
      availableLanguages: ['en', 'fr'],
      showLanguageSwitcher: true,
    });
    expect(root(fixture).textContent).toContain('Accept all');
    i18n.setLanguage('fr');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root(fixture).textContent).toContain('Tout accepter');
  });
});
