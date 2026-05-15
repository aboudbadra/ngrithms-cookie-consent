import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ConsentService } from './consent.service';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { CookieConsentConfig } from '../types/config';
import { Category } from '../types/category';
import { ConsentState } from '../types/consent-state';

const ANALYTICS: Category = {
  key: 'analytics',
  name: 'Analytics',
  items: [
    { key: 'google_analytics', name: 'GA', description: '' },
    { key: 'hotjar', name: 'Hotjar', description: '' },
  ],
};

const MARKETING: Category = {
  key: 'marketing',
  name: 'Marketing',
  items: [{ key: 'google_ads', name: 'Google Ads', description: '' }],
};

function makeFakeDocument() {
  const jar = new Map<string, string>();
  return {
    get cookie(): string {
      return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    },
    set cookie(raw: string) {
      const [pair] = raw.split(';');
      const idx = pair.indexOf('=');
      if (idx === -1) return;
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      if (/expires=Thu, 01 Jan 1970/.test(raw) || value === '') {
        jar.delete(name);
      } else {
        jar.set(name, value);
      }
    },
    location: { protocol: 'http:' },
  };
}

function setup(config: Partial<CookieConsentConfig> = {}, preloadCookie?: string) {
  const doc = makeFakeDocument();
  if (preloadCookie) doc.cookie = preloadCookie;
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: 'browser' },
      {
        provide: COOKIE_CONSENT_CONFIG,
        useValue: {
          categories: [ANALYTICS, MARKETING],
          cookiePrefix: 'test_consent_',
          cookieExpiryDays: 365,
          version: 1,
          ...config,
        } as CookieConsentConfig,
      },
    ],
  });
  return { service: TestBed.inject(ConsentService), doc };
}

describe('ConsentService', () => {
  describe('initial state (no persisted cookie)', () => {
    let service: ConsentService;
    beforeEach(() => {
      ({ service } = setup());
    });

    it('state() is null before a decision', () => {
      expect(service.state()).toBeNull();
    });

    it('hasDecided() is false', () => {
      expect(service.hasDecided()).toBe(false);
    });

    it('bannerVisible() is true', () => {
      expect(service.bannerVisible()).toBe(true);
    });

    it('isGranted is false for non-essential items', () => {
      expect(service.isGranted('google_analytics')()).toBe(false);
    });

    it('isGranted is true for essential items', () => {
      expect(service.isGranted('session')()).toBe(true);
    });

    it('exposes categories with essential prepended', () => {
      expect(service.categories.map((c) => c.key)).toEqual([
        'essential',
        'analytics',
        'marketing',
      ]);
    });

    it('allItemKeys covers every item across categories', () => {
      expect(service.allItemKeys.sort()).toEqual(
        ['session', 'google_analytics', 'hotjar', 'google_ads'].sort(),
      );
    });
  });

  describe('acceptAll', () => {
    it('grants every non-essential item', () => {
      const { service } = setup();
      service.acceptAll();
      expect(service.isGranted('google_analytics')()).toBe(true);
      expect(service.isGranted('hotjar')()).toBe(true);
      expect(service.isGranted('google_ads')()).toBe(true);
    });

    it('hides the banner', () => {
      const { service } = setup();
      service.acceptAll();
      expect(service.bannerVisible()).toBe(false);
    });

    it('marks hasDecided() true', () => {
      const { service } = setup();
      service.acceptAll();
      expect(service.hasDecided()).toBe(true);
    });
  });

  describe('denyAll', () => {
    it('denies all non-essential items', () => {
      const { service } = setup();
      service.denyAll();
      expect(service.isGranted('google_analytics')()).toBe(false);
      expect(service.isGranted('google_ads')()).toBe(false);
    });

    it('still grants essential items', () => {
      const { service } = setup();
      service.denyAll();
      expect(service.isGranted('session')()).toBe(true);
    });

    it('counts as a decision', () => {
      const { service } = setup();
      service.denyAll();
      expect(service.hasDecided()).toBe(true);
      expect(service.bannerVisible()).toBe(false);
    });
  });

  describe('accept(subset)', () => {
    it('grants only the listed items', () => {
      const { service } = setup();
      service.accept(['google_analytics']);
      expect(service.isGranted('google_analytics')()).toBe(true);
      expect(service.isGranted('hotjar')()).toBe(false);
      expect(service.isGranted('google_ads')()).toBe(false);
    });

    it('essential remains granted even if not listed', () => {
      const { service } = setup();
      service.accept(['google_analytics']);
      expect(service.isGranted('session')()).toBe(true);
    });
  });

  describe('persistence', () => {
    it('writes a JSON cookie with prefix + "state"', () => {
      const { service, doc } = setup();
      service.acceptAll();
      expect(doc.cookie).toMatch(/test_consent_state=/);
    });

    it('hydrates from a persisted cookie on init', () => {
      const persisted: ConsentState = {
        granted: { google_analytics: true, hotjar: false, google_ads: false },
        timestamp: 12345,
        version: 1,
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(persisted))}`;
      const { service } = setup({}, cookie);
      expect(service.hasDecided()).toBe(true);
      expect(service.bannerVisible()).toBe(false);
      expect(service.isGranted('google_analytics')()).toBe(true);
      expect(service.isGranted('hotjar')()).toBe(false);
    });

    it('re-prompts when persisted version mismatches config.version', () => {
      const stale: ConsentState = {
        granted: { google_analytics: true },
        timestamp: 0,
        version: 1,
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(stale))}`;
      const { service } = setup({ version: 2 }, cookie);
      expect(service.hasDecided()).toBe(false);
      expect(service.bannerVisible()).toBe(true);
    });

    it('stamps the current config.version on commit', () => {
      const { service, doc } = setup({ version: 7 });
      service.acceptAll();
      const raw = decodeURIComponent(doc.cookie.split('=').slice(1).join('=').split(';')[0]);
      const parsed = JSON.parse(raw) as ConsentState;
      expect(parsed.version).toBe(7);
      expect(typeof parsed.timestamp).toBe('number');
    });
  });

  describe('reset', () => {
    it('clears the cookie and re-shows the banner', () => {
      const { service, doc } = setup();
      service.acceptAll();
      service.reset();
      expect(service.state()).toBeNull();
      expect(service.hasDecided()).toBe(false);
      expect(service.bannerVisible()).toBe(true);
      expect(doc.cookie).not.toMatch(/test_consent_state=[^;]+/);
    });
  });

  describe('modal visibility', () => {
    it('openModal/closeModal toggles modalVisible', () => {
      const { service } = setup();
      expect(service.modalVisible()).toBe(false);
      service.openModal();
      expect(service.modalVisible()).toBe(true);
      service.closeModal();
      expect(service.modalVisible()).toBe(false);
    });

    it('close() hides both banner and modal', () => {
      const { service } = setup();
      service.open();
      service.openModal();
      service.close();
      expect(service.bannerVisible()).toBe(false);
      expect(service.modalVisible()).toBe(false);
    });

    it('commit hides the modal as well as the banner', () => {
      const { service } = setup();
      service.openModal();
      service.acceptAll();
      expect(service.modalVisible()).toBe(false);
    });
  });

  describe('schemaVersion + migrate', () => {
    it('stamps schemaVersion on commit (defaults to 1)', () => {
      const { service, doc } = setup();
      service.acceptAll();
      const raw = decodeURIComponent(doc.cookie.split('=').slice(1).join('=').split(';')[0]);
      const parsed = JSON.parse(raw) as ConsentState;
      expect(parsed.schemaVersion).toBe(1);
    });

    it('stamps a user-supplied schemaVersion on commit', () => {
      const { service, doc } = setup({ schemaVersion: 3 });
      service.acceptAll();
      const raw = decodeURIComponent(doc.cookie.split('=').slice(1).join('=').split(';')[0]);
      const parsed = JSON.parse(raw) as ConsentState;
      expect(parsed.schemaVersion).toBe(3);
    });

    it('accepts a 0.1.x-style cookie with no schemaVersion as legacy schema 1', () => {
      const legacy = {
        granted: { google_analytics: true, hotjar: false, google_ads: false },
        timestamp: 12345,
        version: 1,
        // no schemaVersion — was missing in 0.1.x writes
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(legacy))}`;
      const { service } = setup({}, cookie);
      expect(service.hasDecided()).toBe(true);
      expect(service.isGranted('google_analytics')()).toBe(true);
    });

    it('discards persisted state when schemaVersion mismatches and no migrate is configured', () => {
      const stale = {
        granted: { ga_old: true },
        timestamp: 0,
        version: 1,
        schemaVersion: 1,
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(stale))}`;
      const { service } = setup({ schemaVersion: 2 }, cookie);
      expect(service.hasDecided()).toBe(false);
      expect(service.bannerVisible()).toBe(true);
    });

    it('runs migrate when schemaVersion mismatches; adopts the returned state', () => {
      const old = {
        granted: { ga: true, hotjar: false, google_ads: false },
        timestamp: 12345,
        version: 1,
        schemaVersion: 1,
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(old))}`;
      const migrate = (stored: unknown): ConsentState => {
        const o = stored as typeof old;
        // Rename "ga" -> "google_analytics".
        return {
          granted: {
            google_analytics: o.granted['ga'] === true,
            hotjar: o.granted['hotjar'] === true,
            google_ads: o.granted['google_ads'] === true,
          },
          timestamp: o.timestamp,
          version: o.version,
          schemaVersion: 2,
        };
      };
      const { service } = setup({ schemaVersion: 2, migrate }, cookie);
      expect(service.hasDecided()).toBe(true);
      expect(service.isGranted('google_analytics')()).toBe(true);
      expect(service.isGranted('hotjar')()).toBe(false);
    });

    it('discards when migrate returns null', () => {
      const old = {
        granted: { ga: true },
        timestamp: 0,
        version: 1,
        schemaVersion: 1,
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(old))}`;
      const { service } = setup({ schemaVersion: 2, migrate: () => null }, cookie);
      expect(service.hasDecided()).toBe(false);
      expect(service.bannerVisible()).toBe(true);
    });

    it('still enforces config.version after migrate (prompt-version re-prompt wins)', () => {
      const old = {
        granted: { ga: true },
        timestamp: 0,
        version: 1,
        schemaVersion: 1,
      };
      const cookie = `test_consent_state=${encodeURIComponent(JSON.stringify(old))}`;
      const migrate = (): ConsentState => ({
        granted: { google_analytics: true },
        timestamp: 0,
        version: 1, // stale prompt version
        schemaVersion: 2,
      });
      const { service } = setup({ schemaVersion: 2, version: 5, migrate }, cookie);
      expect(service.hasDecided()).toBe(false);
    });

    it('rejects malformed (non-object) persisted data without throwing', () => {
      const cookie = `test_consent_state=${encodeURIComponent('"a-string"')}`;
      const { service } = setup({}, cookie);
      expect(service.hasDecided()).toBe(false);
    });
  });

  describe('essential category override', () => {
    it('user-supplied essential items are honored and always granted', () => {
      const { service } = setup({
        essential: {
          items: [
            { key: 'csrf', name: 'CSRF', description: '' },
            { key: 'auth', name: 'Auth', description: '' },
          ],
        },
      });
      expect(service.essentialItemKeys).toEqual(['csrf', 'auth']);
      expect(service.isGranted('csrf')()).toBe(true);
      expect(service.isGranted('auth')()).toBe(true);
      // Even after denyAll, essential stays granted.
      service.denyAll();
      expect(service.isGranted('csrf')()).toBe(true);
    });

    it('a user category with key "essential" is dropped (essential is reserved)', () => {
      const fake: Category = {
        key: 'essential',
        name: 'Sneaky',
        items: [{ key: 'sneaky', name: 'Sneaky', description: '' }],
      };
      const { service } = setup({ categories: [fake, ANALYTICS] });
      expect(service.categories.map((c) => c.key)).toEqual(['essential', 'analytics']);
      // The injected "essential" was replaced by the default — sneaky item is not present.
      expect(service.allItemKeys).not.toContain('sneaky');
    });
  });
});
