import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ScriptLoaderService } from './script-loader.service';
import { ConsentService } from './consent.service';
import { COOKIE_CONSENT_CONFIG } from '../tokens/config.token';
import { CookieConsentConfig } from '../types/config';
import { Category } from '../types/category';

const ANALYTICS: Category = {
  key: 'analytics',
  name: 'Analytics',
  items: [
    { key: 'google_analytics', name: 'GA', description: '' },
    { key: 'hotjar', name: 'Hotjar', description: '' },
  ],
};

function configureBrowser(prefix = `test_loader_${Math.random().toString(36).slice(2)}_`) {
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
        } as CookieConsentConfig,
      },
    ],
  });
}

function queryScripts(): HTMLScriptElement[] {
  return Array.from(document.head.querySelectorAll('script[data-test="loader-spec"]'));
}

function clearTrackedScripts(): void {
  for (const node of queryScripts()) node.remove();
}

async function flush(): Promise<void> {
  TestBed.tick();
  await Promise.resolve();
}

describe('ScriptLoaderService', () => {
  describe('browser', () => {
    let loader: ScriptLoaderService;
    let consent: ConsentService;

    beforeEach(() => {
      configureBrowser();
      loader = TestBed.inject(ScriptLoaderService);
      consent = TestBed.inject(ConsentService);
      clearTrackedScripts();
    });

    it('does not inject the script before consent is granted', async () => {
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/a.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      await flush();
      expect(queryScripts()).toHaveLength(0);
    });

    it('injects once consent is granted', async () => {
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/b.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      consent.acceptAll();
      await flush();
      const scripts = queryScripts();
      expect(scripts).toHaveLength(1);
      expect(scripts[0].src).toBe('https://example.com/b.js');
    });

    it('applies attrs — string values set the attribute, true sets empty, false omits', async () => {
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/c.js',
        attrs: {
          'data-test': 'loader-spec',
          async: true,
          defer: false,
          'data-extra': 'hello',
        },
      });
      consent.acceptAll();
      await flush();
      const [script] = queryScripts();
      expect(script.hasAttribute('async')).toBe(true);
      expect(script.hasAttribute('defer')).toBe(false);
      expect(script.getAttribute('data-extra')).toBe('hello');
    });

    it('does not re-inject while consent stays granted', async () => {
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/d.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      consent.acceptAll();
      await flush();
      // Another commit with the same granted state should not duplicate.
      consent.acceptAll();
      await flush();
      expect(queryScripts()).toHaveLength(1);
    });

    it('supports inline scripts', async () => {
      loader.load({
        itemKey: 'google_analytics',
        inline: 'window.__loaderSpec = true;',
        attrs: { 'data-test': 'loader-spec' },
      });
      consent.acceptAll();
      await flush();
      const [script] = queryScripts();
      expect(script.src).toBe('');
      expect(script.text).toContain('__loaderSpec');
    });

    it('removes the script when consent is revoked', async () => {
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/e.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      consent.acceptAll();
      await flush();
      expect(queryScripts()).toHaveLength(1);
      consent.denyAll();
      await flush();
      expect(queryScripts()).toHaveLength(0);
    });

    it('re-injects on re-grant after a revoke', async () => {
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/f.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      consent.acceptAll();
      await flush();
      consent.denyAll();
      await flush();
      consent.acceptAll();
      await flush();
      const scripts = queryScripts();
      expect(scripts).toHaveLength(1);
      expect(scripts[0].src).toBe('https://example.com/f.js');
    });

    it('hydrates from persisted state — script appears immediately when itemKey is granted', async () => {
      // Pre-grant before calling load() to simulate "user already consented on prior visit".
      consent.accept(['google_analytics']);
      await flush();
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/g.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      await flush();
      expect(queryScripts()).toHaveLength(1);
    });

    it('can be called from outside an injection context (no NG0203)', () => {
      // Regression: previously `loader.load()` failed when called from anywhere other than
      // a constructor / field initializer because `consent.item$()` used `toObservable`.
      expect(() =>
        loader.load({
          itemKey: 'google_analytics',
          src: 'https://example.com/h.js',
          attrs: { 'data-test': 'loader-spec' },
        }),
      ).not.toThrow();
    });
  });

  describe('server (SSR)', () => {
    it('load() is a no-op and never touches document', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' },
          {
            provide: COOKIE_CONSENT_CONFIG,
            useValue: {
              categories: [ANALYTICS],
              cookiePrefix: 'test_loader_ssr_',
              cookieExpiryDays: 365,
              version: 1,
            } as CookieConsentConfig,
          },
        ],
      });
      const loader = TestBed.inject(ScriptLoaderService);
      const consent = TestBed.inject(ConsentService);
      clearTrackedScripts();
      loader.load({
        itemKey: 'google_analytics',
        src: 'https://example.com/ssr.js',
        attrs: { 'data-test': 'loader-spec' },
      });
      consent.acceptAll();
      await flush();
      expect(queryScripts()).toHaveLength(0);
    });
  });
});
