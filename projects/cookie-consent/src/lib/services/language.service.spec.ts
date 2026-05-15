import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { CookieConsentConfig } from '../types/config';
import { LanguagePack } from '../types/language-pack';

function setup(config: Partial<CookieConsentConfig>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: COOKIE_CONSENT_CONFIG,
        useValue: { categories: [], ...config } as CookieConsentConfig,
      },
    ],
  });
  return TestBed.inject(LanguageService);
}

const SW_PACK: LanguagePack = {
  languageKey: 'sw',
  languageName: 'Kiswahili',
  translations: { 'banner.title': 'Tunatumia vidakuzi' },
  fallback: 'fr',
};

const FR_OVERRIDE: LanguagePack = {
  languageKey: 'fr',
  languageName: 'Français (custom)',
  translations: { 'banner.title': 'Cookies (custom FR)' },
};

describe('LanguageService', () => {
  it('uses defaultLanguage on startup', () => {
    const svc = setup({ defaultLanguage: 'fr', availableLanguages: ['en', 'fr'] });
    expect(svc.currentLanguage()).toBe('fr');
  });

  it('falls back to en when defaultLanguage is unknown', () => {
    const svc = setup({ defaultLanguage: 'zz' });
    expect(svc.currentLanguage()).toBe('en');
  });

  it('setLanguage switches active language', () => {
    const svc = setup({ availableLanguages: ['en', 'fr'] });
    svc.setLanguage('fr');
    expect(svc.currentLanguage()).toBe('fr');
  });

  it('setLanguage is a no-op for unknown codes', () => {
    const svc = setup({ availableLanguages: ['en', 'fr'] });
    svc.setLanguage('zz');
    expect(svc.currentLanguage()).toBe('en');
  });

  it('translateNow returns the active language value', () => {
    const svc = setup({ defaultLanguage: 'fr', availableLanguages: ['en', 'fr'] });
    expect(svc.translateNow('banner.accept_all')).toBe('Tout accepter');
  });

  it('translate signal updates reactively when language changes', () => {
    const svc = setup({ availableLanguages: ['en', 'fr'] });
    const title = svc.translate('banner.accept_all');
    expect(title()).toBe('Accept all');
    svc.setLanguage('fr');
    expect(title()).toBe('Tout accepter');
  });

  it('falls back via pack.fallback when key missing in active language', () => {
    const svc = setup({
      defaultLanguage: 'sw',
      availableLanguages: ['en', 'fr', 'sw'],
      customLanguages: { sw: SW_PACK },
    });
    // 'banner.accept_all' is missing in SW → falls back to FR (pack.fallback)
    expect(svc.translateNow('banner.accept_all')).toBe('Tout accepter');
  });

  it('falls back to defaultLanguage then en when pack.fallback also misses', () => {
    const svc = setup({
      defaultLanguage: 'en',
      availableLanguages: ['en', 'sw'],
      customLanguages: {
        sw: { ...SW_PACK, fallback: 'zz' },
      },
    });
    svc.setLanguage('sw');
    expect(svc.translateNow('banner.accept_all')).toBe('Accept all');
  });

  it('returns the key itself when no pack has the translation', () => {
    const svc = setup({});
    expect(svc.translateNow('no.such.key')).toBe('no.such.key');
  });

  it('customLanguages override built-in packs', () => {
    const svc = setup({
      defaultLanguage: 'fr',
      availableLanguages: ['en', 'fr'],
      customLanguages: { fr: FR_OVERRIDE },
    });
    expect(svc.translateNow('banner.title')).toBe('Cookies (custom FR)');
  });

  it('resolveNow passes through plain strings', () => {
    const svc = setup({});
    expect(svc.resolveNow('https://example.com/privacy')).toBe('https://example.com/privacy');
  });

  it('resolveNow looks up TranslatableString objects by active language', () => {
    const svc = setup({ availableLanguages: ['en', 'fr'] });
    const value = { en: 'Privacy', fr: 'Vie privée' };
    expect(svc.resolveNow(value)).toBe('Privacy');
    svc.setLanguage('fr');
    expect(svc.resolveNow(value)).toBe('Vie privée');
  });

  it('resolveNow falls back to first available value when no chain code matches', () => {
    const svc = setup({});
    expect(svc.resolveNow({ de: 'Datenschutz' })).toBe('Datenschutz');
  });

  it('resolveNow returns empty string for undefined input', () => {
    const svc = setup({});
    expect(svc.resolveNow(undefined)).toBe('');
  });

  it('availableLanguages signal filters out codes with no pack', () => {
    const svc = setup({ availableLanguages: ['en', 'fr', 'zz'] });
    expect(svc.availableLanguages()).toEqual(['en', 'fr']);
  });
});
