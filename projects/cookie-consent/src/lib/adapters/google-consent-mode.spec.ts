import { describe, expect, it, vi } from 'vitest';
import {
  applyGoogleConsentMode,
  consentToGoogleConsentObject,
} from './google-consent-mode';
import { ConsentState } from '../types/consent-state';
import { ConsentService } from '../services/consent.service';
import { Subject } from 'rxjs';

describe('consentToGoogleConsentObject', () => {
  it('returns all denied when state is null', () => {
    const result = consentToGoogleConsentObject(null, {
      google_analytics: 'analytics_storage',
      google_ads: ['ad_storage', 'ad_user_data'],
    });
    expect(result).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
    });
  });

  it('maps granted items to granted, missing items to denied', () => {
    const state: ConsentState = {
      granted: { google_analytics: true, google_ads: false },
      timestamp: 0,
      version: 1,
    };
    const result = consentToGoogleConsentObject(state, {
      google_analytics: 'analytics_storage',
      google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
    });
    expect(result).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('expands array targets to multiple consent types', () => {
    const state: ConsentState = {
      granted: { google_ads: true },
      timestamp: 0,
      version: 1,
    };
    const result = consentToGoogleConsentObject(state, {
      google_ads: ['ad_storage', 'ad_user_data', 'ad_personalization'],
    });
    expect(result).toEqual({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('treats explicit false the same as missing', () => {
    const state: ConsentState = {
      granted: { google_analytics: false },
      timestamp: 0,
      version: 1,
    };
    const result = consentToGoogleConsentObject(state, {
      google_analytics: 'analytics_storage',
    });
    expect(result).toEqual({ analytics_storage: 'denied' });
  });
});

describe('applyGoogleConsentMode', () => {
  function makeStateStream() {
    const subject = new Subject<ConsentState | null>();
    const consent = { state$: subject.asObservable() } as unknown as ConsentService;
    return { subject, consent };
  }

  it('returns a no-op when gtag is not provided and not on window', () => {
    const { consent } = makeStateStream();
    const teardown = applyGoogleConsentMode(consent, {
      mapping: { google_analytics: 'analytics_storage' },
    });
    expect(typeof teardown).toBe('function');
    expect(() => teardown()).not.toThrow();
  });

  it('calls gtag("consent","default",...) once with defaults', () => {
    const gtag = vi.fn();
    const { consent } = makeStateStream();
    applyGoogleConsentMode(consent, {
      gtag,
      mapping: { google_analytics: 'analytics_storage' },
      defaults: { analytics_storage: 'denied' },
    });
    expect(gtag).toHaveBeenCalledWith('consent', 'default', { analytics_storage: 'denied' });
  });

  it('calls gtag("consent","update",...) on every state emission', () => {
    const gtag = vi.fn();
    const { subject, consent } = makeStateStream();
    applyGoogleConsentMode(consent, {
      gtag,
      mapping: { google_analytics: 'analytics_storage' },
    });
    // toObservable would re-emit on subscribe — we're using a plain Subject here, so emit explicitly.
    subject.next({ granted: { google_analytics: true }, timestamp: 0, version: 1 });
    expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
      analytics_storage: 'granted',
    });
    subject.next({ granted: { google_analytics: false }, timestamp: 1, version: 1 });
    expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
      analytics_storage: 'denied',
    });
  });

  it('teardown unsubscribes — no further updates after calling it', () => {
    const gtag = vi.fn();
    const { subject, consent } = makeStateStream();
    const teardown = applyGoogleConsentMode(consent, {
      gtag,
      mapping: { google_analytics: 'analytics_storage' },
    });
    teardown();
    const before = gtag.mock.calls.length;
    subject.next({ granted: { google_analytics: true }, timestamp: 0, version: 1 });
    expect(gtag.mock.calls.length).toBe(before);
  });
});