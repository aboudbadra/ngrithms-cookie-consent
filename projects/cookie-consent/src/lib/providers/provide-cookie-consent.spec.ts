import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideCookieConsent } from './provide-cookie-consent';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { ANALYTICS_PRESET } from '../presets';

function configFrom(providers: ReturnType<typeof provideCookieConsent>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [providers] });
  return TestBed.inject(COOKIE_CONSENT_CONFIG);
}

describe('provideCookieConsent', () => {
  it('applies defaults when user provides only categories', () => {
    const cfg = configFrom(provideCookieConsent({ categories: [ANALYTICS_PRESET] }));
    expect(cfg.defaultLanguage).toBe('en');
    expect(cfg.availableLanguages).toEqual(['en']);
    expect(cfg.cookiePrefix).toBe('ngrithms_consent_');
    expect(cfg.cookieExpiryDays).toBe(365);
    expect(cfg.position).toBe('bottom-bar');
    expect(cfg.theme).toBe('default');
    expect(cfg.hideDeny).toBe(false);
    expect(cfg.hideImprint).toBe(false);
    expect(cfg.version).toBe(1);
  });

  it('user values win over defaults', () => {
    const cfg = configFrom(
      provideCookieConsent({
        categories: [],
        cookiePrefix: 'my_app_',
        cookieExpiryDays: 30,
        hideDeny: true,
        theme: 'dark',
        version: 7,
      }),
    );
    expect(cfg.cookiePrefix).toBe('my_app_');
    expect(cfg.cookieExpiryDays).toBe(30);
    expect(cfg.hideDeny).toBe(true);
    expect(cfg.theme).toBe('dark');
    expect(cfg.version).toBe(7);
  });

  it('infers showLanguageSwitcher=false when only one language', () => {
    const cfg = configFrom(
      provideCookieConsent({ categories: [], availableLanguages: ['en'] }),
    );
    expect(cfg.showLanguageSwitcher).toBe(false);
  });

  it('infers showLanguageSwitcher=true when multiple languages', () => {
    const cfg = configFrom(
      provideCookieConsent({ categories: [], availableLanguages: ['en', 'fr'] }),
    );
    expect(cfg.showLanguageSwitcher).toBe(true);
  });

  it('explicit showLanguageSwitcher overrides inference', () => {
    const cfg = configFrom(
      provideCookieConsent({
        categories: [],
        availableLanguages: ['en', 'fr'],
        showLanguageSwitcher: false,
      }),
    );
    expect(cfg.showLanguageSwitcher).toBe(false);
  });

  it('falls back to ["en"] when availableLanguages is empty', () => {
    const cfg = configFrom(
      provideCookieConsent({ categories: [], availableLanguages: [] }),
    );
    expect(cfg.availableLanguages).toEqual(['en']);
  });
});
